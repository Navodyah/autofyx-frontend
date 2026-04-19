"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Trash2, CarFront, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WishlistItem = {
  id: string;
  name: string;
  note?: string;
};

const STORAGE_KEY = "autofyx_wishlist";

export default function GaragePage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WishlistItem[];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const sorted = useMemo(() => [...items].reverse(), [items]);

  function addItem() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next: WishlistItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      note: note.trim() || undefined,
    };
    setItems((prev) => [...prev, next]);
    setName("");
    setNote("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Garage (Wishlist)</h1>
        <p className="text-sm text-slate-500">Save vehicles you want to track and compare later.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-rose-500" />
            Add To Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Vehicle name (e.g., Toyota Prius 2022)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="md:col-span-2"
          />
          <Button onClick={addItem} className="md:col-span-1 gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="pt-6 text-center text-slate-500">
              No wishlist items yet. Add your first vehicle above.
            </CardContent>
          </Card>
        )}

        {sorted.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <CarFront className="h-4 w-4 text-blue-600" />
                    {item.name}
                  </p>
                  {item.note && <p className="text-sm text-slate-500 mt-1">{item.note}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
