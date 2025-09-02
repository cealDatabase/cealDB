export const PersonnelInstructions = () => {
  return (
    <div>
      <h2>Personnel Instructions</h2>

      Personnel Support 

Personnel Support Form 

Essential Information: 

Report the number of FTE (full-time equivalent) staff, including filled positions and those that are only temporarily vacant. 

For staff working across multiple languages, either: 

Estimate the percentage split under each CJK language, or 

Report them under East Asian fields. 

Use decimals where appropriate (e.g., 0.5 FTE). 

No need to fill in subtotal or total fields. The system will calculate them automatically. 

Scopes of Personnel: 

Professional Staff: staff your library considers professional. 

Support Staff: staff not included as professional staff: Staff not included as professional staff. 

Student Assistants: total FTE of student assistants employed hourly, paid either from library funds or other institutional budgets (including work-study programs). Exclude maintenance and custodial staff. 

Others, FTE: staff in the parent institution significantly involved in processing/servicing East Asian materials or hired for special projects. 

[Show more…] 

Field breakdown 

Professional Staff 

01. Professional Chinese (integer or decimal) 

02. Professional Japanese (integer or decimal) 

03. Professional Korean (integer or decimal) 

04. Professional East Asian (integer or decimal) 

05. Professional Total (auto-calculate: 01 + 02 + 03 + 04) 

 

Support Staff 

06. Support Chinese 

07. Support Japanese 

08. Support Korean 

09. Support East Asian 

10. Support Total (auto-calculate: 06 + 07 + 08 + 09) 

 

Student Assistants 

11. Student Chinese 

12. Student Japanese 

13. Student Korean 

14. Student East Asian 

15. Student Total (auto-calculate: 11 + 12 +13 +14) 

 

Others, FTE: 

16. Others 

 

Total Personnel 

17. Total Personnel (auto-calculate: 05 + 10 + 15 + 16) 

 

18. Acquisition Outsourcing (select Yes or No)  

19. Processing Outsourcing (select Yes or No) 
    </div>
  )
}