"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/battles');
        if (res.data.success) {
          setHistory(res.data.data.battles.filter((b: any) => b.status === 'COMPLETED' || b.status === 'CANCELLED'));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Battle History</h1>
          <p className="text-lg text-gray-500 mt-2">A record of your past coding arenas.</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Completed Battles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-gray-500">No completed battles found. Start fighting in the Arena!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Battle Code</th>
                      <th className="px-6 py-3">Mode</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(battle => (
                      <tr key={battle.battleCode} className="border-b bg-white hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatDate(battle.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-mono text-blue-600">
                          {battle.battleCode}
                        </td>
                        <td className="px-6 py-4">
                          {battle.battleMode} ({battle.battleType})
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${battle.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {battle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/battle/${battle.battleCode}`}>
                            <Button variant="outline" size="sm">Details</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
