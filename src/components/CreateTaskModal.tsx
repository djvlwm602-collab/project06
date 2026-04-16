import React, { useState } from 'react';
import { Task, Priority, TaskType } from '../types';
import { X } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt'>) => void;
  defaultColumnId?: string;
}

export function CreateTaskModal({ isOpen, onClose, onCreate, defaultColumnId }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Story');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState(defaultColumnId || 'todo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title,
      description,
      type,
      priority,
      status,
      reporterId: 'currentUser',
      assigneeId: '', // Unassigned by default
    });

    // Reset form
    setTitle('');
    setDescription('');
    setType('Story');
    setPriority('Medium');
    setStatus(defaultColumnId || 'todo');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">이슈 만들기</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-task-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이슈 유형 <span className="text-red-500">*</span>
              </label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value as TaskType)}
                className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Story">스토리</option>
                <option value="Task">작업</option>
                <option value="Bug">버그</option>
              </select>
            </div>

            <hr className="border-gray-200" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                요약 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="무엇을 해야 합니까?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="자세한 내용 추가..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Highest">가장 높음</option>
                  <option value="High">높음</option>
                  <option value="Medium">중간</option>
                  <option value="Low">낮음</option>
                  <option value="Lowest">가장 낮음</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todo">할 일</option>
                  <option value="in-progress">진행 중</option>
                  <option value="in-review">리뷰 중</option>
                  <option value="done">완료</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-sm transition-colors"
          >
            취소
          </button>
          <button 
            type="submit" 
            form="create-task-form"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors"
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
}
