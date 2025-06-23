'use client';

import { useEffect, useRef } from 'react';

export default function ResponsiveTableWithDoubleScrollbar() {
  const topScrollbarRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const top = topScrollbarRef.current;
    const bottom = bottomScrollbarRef.current;
    const content = contentRef.current;

    if (!top || !bottom || !content) return;

    const scrollWidth = content.scrollWidth;

    const topInner = document.createElement('div');
    const bottomInner = document.createElement('div');
    topInner.style.width = `${scrollWidth}px`;
    bottomInner.style.width = `${scrollWidth}px`;
    top.innerHTML = '';
    bottom.innerHTML = '';
    top.appendChild(topInner);
    bottom.appendChild(bottomInner);

    const syncTop = () => {
      top.scrollLeft = bottom.scrollLeft = content.scrollLeft;
    };
    const syncFromTop = () => {
      content.scrollLeft = bottom.scrollLeft = top.scrollLeft;
    };
    const syncFromBottom = () => {
      content.scrollLeft = top.scrollLeft = bottom.scrollLeft;
    };

    content.addEventListener('scroll', syncTop);
    top.addEventListener('scroll', syncFromTop);
    bottom.addEventListener('scroll', syncFromBottom);

    return () => {
      content.removeEventListener('scroll', syncTop);
      top.removeEventListener('scroll', syncFromTop);
      bottom.removeEventListener('scroll', syncFromBottom);
    };
  }, []);

  return (
    <div className="w-full space-y-2">
      {/* 滚动提示 */}
      <div className="text-center text-sm text-gray-600 font-medium">
        👈 向左右滑动查看更多列 👉
      </div>

      {/* 顶部滚动条 */}
      <div
        ref={topScrollbarRef}
        className="overflow-x-auto overflow-y-hidden h-4 bg-gray-200 rounded-md scrollbar-visible scrollbar-thin"
      ></div>

      {/* 表格内容容器 */}
      <div
        ref={contentRef}
        className="overflow-x-auto border border-gray-300 rounded-md scrollbar-visible scrollbar-thin"
      >
        <table className="min-w-[1200px] w-max table-auto border-collapse text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              {Array.from({ length: 10 }).map((_, i) => (
                <th key={i} className="border px-4 py-2 text-left text-gray-700">
                  Column {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, row) => (
              <tr key={row}>
                {Array.from({ length: 10 }).map((_, col) => (
                  <td key={col} className="border px-4 py-2 text-gray-800">
                    Row {row + 1} Col {col + 1}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部滚动条 */}
      <div
        ref={bottomScrollbarRef}
        className="overflow-x-auto overflow-y-hidden h-4 bg-gray-200 rounded-md scrollbar-visible scrollbar-thin"
      ></div>
    </div>
  );
}
