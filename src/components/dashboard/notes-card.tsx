"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/app-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function NotesCard() {
  const { selectedDate, getNoteForDate, updateNote } = useApp();
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const note = getNoteForDate(selectedDate);
    setNoteText(note?.text || "");
  }, [selectedDate, getNoteForDate]);

  const handleBlur = () => {
    updateNote(selectedDate, noteText);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Jot down your thoughts for the day..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={handleBlur}
          className="min-h-[120px]"
        />
      </CardContent>
    </Card>
  );
}
