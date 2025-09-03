export const ElectronicBooksInstructions = () => {
    return (
        <div className="space-y-6 text-sm">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Electronic Books Form</h2>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Essential Information</h3>
                    <p className="text-blue-800">Report the number of electronic books held by your library.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-green-700 mb-2">Include:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li>Owned or leased e-books cataloged by your library</li>
                            <li>E-books purchased through vendors (e.g., EBSCO®, ProQuest, Taylor & Francis, Brill, Airiti, Apabi, ChinaMaxx, East View)</li>
                            <li>E-books acquired through Chinese, Japanese, and Korean vendors or bundled services</li>
                            <li>Locally digitized e-books and electronic theses/dissertations</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-red-700 mb-2">Exclude:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li>Items from HathiTrust, CRL, CADAL, Internet Archive, etc., unless they meet the above criteria</li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-yellow-800"><strong>Important:</strong> Subtotal and total fields are calculated automatically. No need to fill them in manually.</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Field Breakdown</h3>
                
                <div className="space-y-6">
                    <div className="border-l-4 border-green-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Purchased Titles</h4>
                        <p className="text-gray-700 mb-2">Report e-books that your library has purchased or owns.</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• <strong>Previous:</strong> System-supplied from previous year</li>
                            <li>• <strong>Add:</strong> Manually enter new titles added this year</li>
                            <li>• <strong>Total:</strong> Auto-calculated (Previous + Add)</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">Languages: Chinese, Japanese, Korean, Non-CJK</p>
                    </div>

                    <div className="border-l-4 border-blue-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Non-Purchased Titles</h4>
                        <p className="text-gray-700">Report e-books that are freely available or accessed without purchase (but cataloged by your library).</p>
                        <p className="text-xs text-gray-500 mt-2">Languages: Chinese, Japanese, Korean, Non-CJK</p>
                    </div>

                    <div className="border-l-4 border-purple-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Subscription Titles</h4>
                        <p className="text-gray-700 mb-2">Report e-books accessed through subscription services.</p>
                        <div className="bg-purple-50 border border-purple-200 rounded p-2 mt-2">
                            <p className="text-purple-800 text-xs"><strong>Tip:</strong> Use the "Import from E-Book Database by Subscription" feature after updating your subscription list.</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Languages: Chinese, Japanese, Korean, Non-CJK</p>
                    </div>

                    <div className="border-l-4 border-green-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Purchased Volumes</h4>
                        <p className="text-gray-700 mb-2">Report the number of volumes for purchased e-books (some titles may have multiple volumes).</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• <strong>Previous:</strong> System-supplied from previous year</li>
                            <li>• <strong>Add:</strong> Manually enter new volumes added this year</li>
                            <li>• <strong>Total:</strong> Auto-calculated (Previous + Add)</li>
                        </ul>
                    </div>

                    <div className="border-l-4 border-blue-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Non-Purchased Volumes</h4>
                        <p className="text-gray-700">Report volumes for non-purchased e-books.</p>
                    </div>

                    <div className="border-l-4 border-purple-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Subscription Volumes</h4>
                        <p className="text-gray-700">Report volumes for subscription e-books.</p>
                    </div>

                    <div className="border-l-4 border-orange-300 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Expenditures</h4>
                        <p className="text-gray-700 mb-2">Report total expenditures for purchased and subscription e-books.</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• <strong>Purchased Expenditure:</strong> By language (Chinese, Japanese, Korean, Non-CJK)</li>
                            <li>• <strong>Subscription Expenditure:</strong> By language (Chinese, Japanese, Korean, Non-CJK)</li>
                        </ul>
                        <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mt-2">All expenditures must be reported in U.S. dollars.</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Summary Totals (Auto-calculated)</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• <strong>Title Total:</strong> Purchased + Non-Purchased + Subscription titles</li>
                            <li>• <strong>Volume Total:</strong> Purchased + Non-Purchased + Subscription volumes</li>
                            <li>• <strong>Expenditure Total:</strong> All expenditures combined</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}