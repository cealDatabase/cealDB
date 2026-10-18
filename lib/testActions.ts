// lib/testActions.ts (server-only)
//
// The Testing page's actions run on the live database: "Test Open Forms" and
// "Test Close Forms" open or close every institution's forms for the year,
// even in Test Mode, and with Test Mode off they email every user. The test
// broadcast route emails every user too. They are off unless the deployment
// sets ENABLE_TEST_ACTIONS=true (Vercel → Settings → Environment Variables,
// then redeploy).

export function testActionsEnabled(): boolean {
  return process.env.ENABLE_TEST_ACTIONS === 'true';
}

export const TEST_ACTIONS_OFF =
  'Test actions are turned off. They open or close real forms and can email every user. ' +
  'To turn them on, set ENABLE_TEST_ACTIONS=true in Vercel and redeploy.';
