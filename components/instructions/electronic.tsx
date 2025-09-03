export const ElectronicInstructions = () => {
    return (
        <div className="space-y-6 text-sm">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Electronic Resources Form</h2>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Essential Information</h3>
                    <p className="text-blue-800">Report a complete picture of the library's electronic resources.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Coverage</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li><strong>Section 1 (1.1-1.5.1):</strong> Count locally held computer files (CD-ROMs, disks, tapes, etc.)</li>
                            <li><strong>Section 2 (2.1-2.3):</strong> Count databases (not e-journal or e-book titles within databases)</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-green-700 mb-2">Include:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li>Paid subscriptions and one-time purchases of electronic indexes, reference tools, full-text collections, and backfiles</li>
                            <li>Online or locally installed databases (e.g., CD-ROM, tape, or disk)</li>
                            <li>Materials purchased jointly with other institutions if expenditures can be separated</li>
                            <li>Fees paid to bibliographic utilities for computer files or search services</li>
                            <li>Equipment costs when bundled into the price of the information product</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-red-700 mb-2">Exclude:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li>Staff-only software, system software</li>
                            <li>Bibliographic utilities not tied to end-user database access</li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-yellow-800"><strong>Important:</strong> All expenditures must be reported in U.S. dollars. Subtotal and total fields are calculated automatically.</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Field Breakdown</h3>
                
                <div className="space-y-6">
                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">1.1 Computer Files (One-time/Monographic)</h4>
                        <p className="text-gray-700 mb-2">Include non-subscription, one-time files such as backfiles or literature collections.</p>
                        <p className="text-sm text-gray-600 italic">Examples: Si ku quan shu (四庫全書, CD-ROM), Genji monogatari honbun kenkyū dētabēsu (源氏物語本文研究データベース), Koryo taejanggyong (高麗大藏經)</p>
                        <ul className="mt-2 text-sm text-gray-600">
                            <li>• Chinese, Japanese, Korean, Non-CJK (Titles & Items)</li>
                            <li>• Subtotal (auto-calculated)</li>
                        </ul>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">1.2 Accompanied Computer Files</h4>
                        <p className="text-gray-700 mb-2">Include CDs bundled with books or journals.</p>
                        <p className="text-sm text-gray-600 italic">Examples: CDs accompanying Chinese yearbook (年鉴), Japanese hakusho (白書), Korean Shin Donga (新東亞)</p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">1.3 Computer Files (Gift Items)</h4>
                        <p className="text-gray-700">Include one-time gift items not covered in 1.1 or 1.2.</p>
                    </div>

                    <div className="border-l-4 border-blue-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">2.1 Electronic Indexes and Reference Tools</h4>
                        <p className="text-gray-700 mb-2">Examples: Bibliography of Asian Studies, MagazinePlus, EncyKorea.</p>
                        <p className="text-sm text-red-600">Exclude: databases with substantial full-text → report in 2.2</p>
                    </div>

                    <div className="border-l-4 border-blue-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">2.2 Electronic Full Text Database and Periodicals</h4>
                        <p className="text-gray-700">Before using the "Import" feature, update your AV/E-book/E-journal lists so the system can generate numbers automatically.</p>
                    </div>

                    <div className="border-l-4 border-green-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">3. Total Electronic Resources Expenditure</h4>
                        <p className="text-gray-700">Record total expenditures for computer files and electronic subscriptions in U.S. dollars.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}