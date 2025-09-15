'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, EllipsisVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu1 } from '@/app/components/partials/dropdown-menu/dropdown-menu-1';

interface IWalletDemoItem {
  title: string;
  description: string;
  statistics: Array<{ total: string; description: string }>;
}

type IWalletDemoItems = Array<IWalletDemoItem>;

export default function WalletsPage() {
  const [activeView, setActiveView] = useState<'cards' | 'list'>('list');

  // Theme default demo data (no API yet)
  const wallets: IWalletDemoItems = [
    {
      title: 'Primary Wallet',
      description: 'Main spending account',
      statistics: [
        { total: '$2,300', description: 'Balance' },
        { total: 'USD', description: 'Currency' },
      ],
    },
    {
      title: 'Savings Wallet',
      description: 'Emergency funds',
      statistics: [
        { total: '$8,120', description: 'Balance' },
        { total: 'USD', description: 'Currency' },
      ],
    },
    {
      title: 'Investment Wallet',
      description: 'Stocks and ETFs',
      statistics: [
        { total: '$12,540', description: 'Balance' },
        { total: 'USD', description: 'Currency' },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
      <div className="flex flex-wrap items-center gap-5 justify-between">
        <h3 className="text-lg text-mono font-semibold">{wallets.length} Wallets</h3>
        <ToggleGroup
          type="single"
          variant="outline"
          value={activeView}
          onValueChange={(value) => {
            if (value === 'cards' || value === 'list') setActiveView(value);
          }}
        >
          <ToggleGroupItem value="cards">
            <LayoutGrid size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="list">
            <List size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {activeView === 'cards' && (
        <div id="wallets_cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
            {wallets.map((wallet, index) => (
              <Card key={index} className="overflow-hidden grow justify-between">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-medium text-mono">{wallet.title}</CardTitle>
                    <div className="text-sm text-secondary-foreground">{wallet.description}</div>
                  </div>
                  <DropdownMenu1
                    trigger={
                      <Button variant="ghost" mode="icon">
                        <EllipsisVertical />
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-start flex-wrap gap-2 lg:gap-5">
                    {wallet.statistics.map((stat, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 content-between gap-1.5 border border-dashed border-input shrink-0 rounded-md px-2.5 py-2 min-w-24 max-w-auto"
                      >
                        <span className="text-mono text-sm leading-none font-medium">{stat.total}</span>
                        <span className="text-secondary-foreground text-xs">{stat.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <Button mode="link" underlined="dashed" asChild>
              <Link href="#">Show more wallets</Link>
            </Button>
          </div>
        </div>
      )}

      {activeView === 'list' && (
        <div id="wallets_list">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            {wallets.map((wallet, index) => (
              <Card key={index} className="p-7.5">
                <div className="flex items-center flex-wrap justify-between gap-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex flex-col">
                      <div className="text-lg font-medium text-mono">{wallet.title}</div>
                      <div className="text-sm text-secondary-foreground">{wallet.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-5 lg:gap-14">
                    <div className="flex items-center lg:justify-center flex-wrap gap-2 lg:gap-5">
                      {wallet.statistics.map((stat, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 content-between gap-1.5 border border-dashed border-input shrink-0 rounded-md px-2.5 py-2 min-w-24 max-w-auto"
                        >
                          <span className="text-mono text-sm leading-none font-semibold">{stat.total}</span>
                          <span className="text-secondary-foreground text-xs font-medium">{stat.description}</span>
                        </div>
                      ))}
                    </div>
                    <DropdownMenu1
                      trigger={
                        <Button variant="ghost" mode="icon">
                          <EllipsisVertical />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <Button mode="link" underlined="dashed" asChild>
              <Link href="#">Show more wallets</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
