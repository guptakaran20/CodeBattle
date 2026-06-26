import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
const execFileAsync = promisify(execFile);
export class ImportValidator {
    async validate(generatorCode, referenceSolutionCode) {
        const startTime = Date.now();
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codearena-import-'));
        const genFile = path.join(tempDir, 'generator.py');
        const refFile = path.join(tempDir, 'reference.py');
        try {
            await fs.writeFile(genFile, generatorCode);
            await fs.writeFile(refFile, referenceSolutionCode);
            // Run generator
            const genResult = await execFileAsync('python', [genFile], { timeout: 10000 });
            if (genResult.stderr) {
                throw new Error(`Generator error: ${genResult.stderr}`);
            }
            // Assuming generator outputs inputs separated by '---TEST---'
            const inputs = genResult.stdout.split('---TEST---').map(s => s.trim()).filter(Boolean);
            if (inputs.length === 0) {
                throw new Error('Generator produced no inputs.');
            }
            const hiddenCases = [];
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i] || '';
                // Write input to a temp file or pass via stdin
                const inputFile = path.join(tempDir, `input_${i}.txt`);
                await fs.writeFile(inputFile, input);
                // Pass to reference solution. 
                // We use powershell to cat the file and pipe it, or just use python directly with stdin
                // For security/simplicity in execFile, we can just read the file in python or pipe it.
                // Actually execFile can take child_process options, but passing stdin via execFile directly requires stream writing.
                // Let's create a wrapper runner or just use shell for simplicity, but user requested execFile/spawn.
                // We can pass the file path as an argument to reference.py and read it inside, but reference solution usually reads from stdin.
                // So we will modify reference solution wrapper temporarily to read from the file.
                const wrapperCode = `
import sys
sys.stdin = open(sys.argv[1], 'r')
${referenceSolutionCode}
`;
                const wrapperFile = path.join(tempDir, `wrapper_${i}.py`);
                await fs.writeFile(wrapperFile, wrapperCode);
                const refResult = await execFileAsync('python', [wrapperFile, inputFile], { timeout: 5000 });
                if (refResult.stderr) {
                    throw new Error(`Reference error on test ${i}: ${refResult.stderr}`);
                }
                hiddenCases.push({
                    input,
                    expectedOutput: refResult.stdout.trim(),
                    weight: i < 5 ? 1 : 5, // simple grouping
                    isEdgeCase: i < 5,
                    group: i < 5 ? 'edge' : 'stress'
                });
            }
            return {
                status: 'PASSED',
                hiddenCases,
                errors: [],
                executionTimeMs: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                status: 'FAILED',
                hiddenCases: [],
                errors: [error.message],
                executionTimeMs: Date.now() - startTime
            };
        }
        finally {
            // Cleanup
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            }
            catch (e) {
                console.error('Failed to clean up temp dir', e);
            }
        }
    }
}
//# sourceMappingURL=ImportValidator.js.map