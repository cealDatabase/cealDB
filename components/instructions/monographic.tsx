export const MonographicInstructions = () => {
  return (
    <>
      <div className="section text-left text-sky-500 text-base" id="monographic">
        <h3>
          <strong>Monographic Acquisitions Form (Required)</strong>
        </h3>

        <p>
          <b><i>Monographic Titles and Volumes Purchased:</i></b><br />
          Report number of titles and volumes purchased.<br />
          <b><u>Include</u>:</b> all titles and volumes for which an expenditure was made during the report year, including titles and volumes paid for in advance but not received during the fiscal year.<br />
          <b><u>Include</u>:</b> monographs in series and continuations.
        </p>

        <div className="formitemdesc">
          <p>
            01. Purchased Title Chinese<br />
            02. Purchased Title Japanese<br />
            03. Purchased Title Korean<br />
            04. Purchased Title Non-CJK<br />
            <b>05. Purchased Title Subtotal</b>: <span className="sumtxt">(01 + 02 + 03 + 04)</span>
          </p>

          <p>
            06. Purchased Volume Chinese<br />
            07. Purchased Volume Japanese<br />
            08. Purchased Volume Korean<br />
            09. Purchased Volume Non-CJK<br />
            <b>10. Purchased Volume Subtotal</b>: <span className="sumtxt">(06 + 07 + 08 + 09)</span>
          </p>

          <p>
            11. Non-Purchased Title Chinese&nbsp;(gifts and&nbsp;exchange)<br />
            12. Non-Purchased Title Japanese: (gifts and exchange)<br />
            13. Non-Purchased Title Korean: (gifts and exchange)<br />
            14. Non-Purchased Title Non-CJK: (gifts and exchange)<br />
            <b>15. Non-Purchased Title Subtotal</b>: <span className="sumtxt">(11 + 12 + 13 + 14)</span>
          </p>

          <p>
            16. Non-Purchased Volume Chinese: (Gift volumes and bound periodical volumes)<br />
            17. Non-Purchased Volume Japanese: (Gift volumes and bound periodical volumes)<br />
            18. Non-Purchased Volume Korean: (Gift volumes and bound periodical volumes)<br />
            19. Non-Purchased Volume Non-CJK: (Gift volumes and bound periodical volumes)<br />
            <b>20. Non-Purchased Volume Subtotal</b>: <span className="sumtxt">(16 + 17 + 18 + 19)</span>
          </p>
        </div>

        <div className="formitemdesc">
          <p>
            <b>21. Title Total</b>: <span className="sumtxt">(05 + 15)</span><br />
            <b>22. Volume Total</b>: <span className="sumtxt">(10 + 20)</span><br />
          </p>
        </div>
      </div>
    </>
  );
};