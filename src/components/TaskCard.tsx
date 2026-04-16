import React from 'react';
import { motion } from 'motion/react';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const getTagColor = (tag: Task['tag']) => {
    switch (tag) {
      case '종합진단':
        return 'bg-rose-100 text-rose-700';
      case '보험료점검':
        return 'bg-emerald-100 text-emerald-700';
      case '보장확대':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={(e: any) => onDragStart(e, task.id)}
      className={cn(
        "bg-white p-4 rounded-md border border-gray-200 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors group relative overflow-hidden",
        task.isCancelled && "bg-gray-50"
      )}
    >
      {task.isCancelled && (
        <div className="absolute inset-0 bg-gray-900/60 z-10 flex items-center justify-center p-4 text-center">
          <p className="text-white font-semibold text-sm leading-tight drop-shadow-md">
            고객 상담취소 요청으로<br />
            {task.firstCallDate}
          </p>
        </div>
      )}

      <div className={cn("flex flex-col h-full", task.isCancelled && "opacity-30")}>
        <div className="flex flex-col gap-1.5 mb-4">
        <h4 className="font-medium text-gray-900 text-sm leading-snug hover:underline cursor-pointer">
          {task.name} ({task.age}세 / {task.gender} / {task.location})
        </h4>
        <p className="text-gray-500 text-xs">{task.phone}</p>
      </div>

      <div className="flex flex-col gap-0.5 mb-4 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">배정일</span>
          <span>{task.assignedDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">최초통화</span>
          <span>{task.isCancelled ? '삭제 예정' : task.firstCallDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">최근통화</span>
          <span>{task.recentCallDate}</span>
        </div>
      </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-sm font-medium", getTagColor(task.tag))}>
              {task.tag}
            </span>
            <button className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-sm font-medium hover:bg-gray-200 transition-colors">
              AI 상담내역
            </button>
          </div>
          <span className="text-xs font-medium text-gray-500">
            {task.callCount}회 통화
          </span>
        </div>
      </div>
    </motion.div>
  );
}
