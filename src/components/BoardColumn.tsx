import React, { useState } from 'react';
import { Column, Task } from '../types';
import { TaskCard } from './TaskCard';
import { cn } from '../lib/utils';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onCreateTask: (columnId: string) => void;
}

export function BoardColumn({ column, tasks, onDragStart, onDrop, onCreateTask }: BoardColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, column.id);
  };

  return (
    <div className="flex flex-col w-full min-w-[200px] bg-[#F0F2F5] rounded-md h-full">
      <div className="flex items-center gap-2 p-3 pb-2 shrink-0">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
          {column.title}
        </h3>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 px-2 pb-2 flex flex-col gap-2 transition-colors",
          isDragOver ? "bg-blue-50/50" : ""
        )}
      >
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onDragStart} 
          />
        ))}
      </div>
    </div>
  );
}
