export const VolumeHoldingsInstructions = () => {
    return (
        <div>
            <div className="section text-left text-sky-500 text-base" id="volumeHoldings"><h3 className="underline"><strong>Physical Total Volume Holdings Form (Required)</strong></h3>

                <p><strong>Previously reported monographs held by the institution will be supplied by the CEAL database</strong>. <u>New libraries</u>&nbsp;need to&nbsp;fill out the data according to individual collections information. Contact vdoll@ku.edu for questions.</p>

                <p><b><u>Include</u>:</b> duplicates and bound volumes of periodicals. For purposes of this questionnaire, uncataloged/unclassified bound serials arranged in alphabetical order are considered <span className="highlight">classified</span>.<br />
                    <b><u>Exclude</u>:</b> microforms, maps, non-print materials, and un-cataloged items.</p>

                <p>See the ANSI Z39.7-1995 definition for volume as follows:</p>

                <p><b><i>Volume</i></b>. <i>A single physical unit of any printed, typewritten, handwritten, mimeographed, or processed work, distinguished from other units by a separate binding, encasement, portfolio, or other clear distinction, which has been cataloged, classified, and made ready for use, and which is typically the unit used to charge circulation transactions. Either a serial volume is bound, or it comprises the serial issues that would be bound together if the library bound all serials</i>.</p>

                <p><b><i>Volumes added:</i></b><br />
                    <span className="highlight"><b><u>Include</u>:</b> only volumes cataloged, classified, and made ready for use.</span></p>

                <p><span >*The values of fields 01-05 are automatically filled with previous year's data from CEAL Database (if available). *</span></p>

                <div className="formitemdesc">
                    <p >01. Previous Chinese*:&nbsp;<br />
                        02. Previous Japanese*:&nbsp;<br />
                        03. Previous Korean*:&nbsp;<br />
                        04. Previous Non-CJK*:<br />
                        <b>05. Previous Subtotal*</b>: <span className="sumtxt">(01 + 02 + 03 + 04)</span><br />
                        &nbsp;</p>

                    <p >06. Added Chinese<br />
                        07. Added Japanese<br />
                        08. Added Korean<br />
                        09. Added Non-CJK<br />
                        <b>10. Added Subtotal</b>: <span className="sumtxt">(06 + 07 + 08 + 09)</span><br />
                        &nbsp;</p>
                </div>

                <div className="formitemdesc">
                    <p>11. Withdrawn Chinese<br />
                        12. Withdrawn Japanese<br />
                        13. Withdrawn Korean<br />
                        14. Withdrawn Non-CJK<br />
                        <b>15. Withdrawn Subtotal</b>: <span className="sumtxt">(11 + 12 + 13 + 14)</span><br />
                        <b>16. Grand Total</b>: <span className="sumtxt">(05 + 10 - 15)</span></p>
                </div>
            </div>
        </div>
    )
}