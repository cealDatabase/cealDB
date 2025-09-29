"use client";

import { useState, useEffect } from "react";

export default function DebugCookiesPage() {
  const [cookies, setCookies] = useState<any>(null);
  const [libid, setLibid] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCookies();
  }, []);

  const fetchCookies = async () => {
    try {
      const response = await fetch("/api/set-cookies");
      const data = await response.json();
      setCookies(data);
    } catch (error) {
      console.error("Error fetching cookies:", error);
    }
  };

  const handleSetCookies = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/set-cookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ libid, role }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage("Cookies set successfully! Refresh the page to see the changes.");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Error setting cookies");
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Cookies</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Cookies:</h2>
        <pre className="text-sm overflow-auto">
          {cookies ? JSON.stringify(cookies, null, 2) : "Loading..."}
        </pre>
      </div>
      
      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Specific Cookies:</h2>
        <p><strong>libid:</strong> {cookies?.libid || "Not found"}</p>
        <p><strong>role:</strong> {cookies?.role || "Not found"}</p>
      </div>
      
      <div className="bg-green-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-4">Set Cookies:</h2>
        <form onSubmit={handleSetCookies} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Library ID:
            </label>
            <input
              type="number"
              value={libid}
              onChange={(e) => setLibid(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              placeholder="e.g., 56"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Role ID:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="">Select Role</option>
              <option value="1">1 - Super Admin</option>
              <option value="2">2 - Member</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Set Cookies
          </button>
        </form>
        {message && (
          <div className="mt-4 p-3 bg-yellow-100 rounded">
            {message}
          </div>
        )}
      </div>
      
      <div className="bg-yellow-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Test Links:</h2>
        <ul className="space-y-2">
          <li>
            <a href="/admin/forms/member/avdbedit" className="text-blue-600 hover:underline">
              /admin/forms/member/avdbedit (Member View)
            </a>
          </li>
          <li>
            <a href="/admin/forms/56/avdbedit" className="text-blue-600 hover:underline">
              /admin/forms/56/avdbedit (Admin View)
            </a>
          </li>
          <li>
            <a href="/admin/survey/avdb/2025" className="text-blue-600 hover:underline">
              /admin/survey/avdb/2025 (Survey Page)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
