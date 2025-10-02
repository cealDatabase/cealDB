'use client'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import React from 'react'
import Link from 'next/link'

interface UserInfo {
    userId: number;
    userRoles: string[];
}

interface AdminHelpClientProps {
    userInfo: UserInfo | null;
}

const openNewYearForm = async () => {
    // Show loading message
    const loadingMessage = 'Processing... Opening new year forms for all libraries.';
    console.log(loadingMessage);

    // You could also show a loading indicator in the UI here
    const button = document.querySelector('button');
    const originalText = button?.textContent;
    if (button) {
        button.textContent = 'Processing...';
        button.disabled = true;
    }

    try {
        console.log('🚀 Starting new year form opening process...');
        console.log('🔗 Connecting to database...');

        const response = await fetch('/api/admin/open-new-year', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log('📊 API Response:', result);

            // Create detailed success message
            let message = `✅ Successfully opened ${result.year} forms!\n\n`;
            message += `📋 Summary:\n`;
            message += `• Total Libraries: ${result.totalLibraries}\n`;
            message += `• New Records Created: ${result.count}\n`;
            message += `• Existing Records Skipped: ${result.skipped || 0}\n`;
            message += `• Total Active Records for ${result.year}: ${result.totalActiveRecords}\n\n`;

            if (result.summary) {
                message += `📊 Breakdown:\n`;
                message += `• Created: ${result.summary.created}\n`;
                message += `• Skipped: ${result.summary.skipped}\n`;
                if (result.summary.errors > 0) {
                    message += `• Errors: ${result.summary.errors}\n`;
                }
            }

            // Show detailed information in console
            if (result.details && result.details.length > 0) {
                console.log('📝 Detailed Results:');
                result.details.forEach((detail: any, index: number) => {
                    console.log(`${index + 1}. ${detail.library_name} (ID: ${detail.library_id}) - ${detail.action.toUpperCase()}`);
                    if (detail.reason) {
                        console.log(`   Reason: ${detail.reason}`);
                    }
                    if (detail.error) {
                        console.log(`   Error: ${detail.error}`);
                    }
                });
            }

            alert(message);
            console.log('✅ Process completed successfully!');

        } else {
            // Handle HTTP errors
            let errorMessage = 'Error opening new year forms.';
            try {
                const errorData = await response.json();
                console.error('❌ API Error Response:', errorData);
                errorMessage += `\n\nError Details: ${errorData.error || 'Unknown error'}`;
                if (errorData.detail) {
                    errorMessage += `\nDetails: ${errorData.detail}`;
                }
            } catch (parseError) {
                console.error('❌ Could not parse error response:', parseError);
                errorMessage += `\n\nHTTP Status: ${response.status} ${response.statusText}`;
            }

            alert(errorMessage);
            console.error('❌ Process failed with HTTP error');
        }
    } catch (error) {
        console.error('❌ Network/Connection Error:', error);
        let errorMessage = 'Connection error while opening new year forms.';

        if (error instanceof Error) {
            errorMessage += `\n\nError: ${error.message}`;
        }

        errorMessage += '\n\nPlease check your internet connection and try again.';
        alert(errorMessage);
        console.error('❌ Process failed with network error');
    } finally {
        // Reset button state
        if (button && originalText) {
            button.textContent = originalText;
            button.disabled = false;
        }
        console.log('🔄 Process finished - button reset');
    }
}

export default function AdminHelpClient({ userInfo }: AdminHelpClientProps) {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <h1>Admin Guide</h1>
            <Container>
                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Button className='w-[200px]' onClick={() => openNewYearForm()}>Open for Year of {currentYear}</Button>
                        <Button className='w-[200px]'><Link href="/signup" className='text-white'>Sign Up New User</Link></Button>
                        <Button className='w-[200px]'><Link href="/admin/users" className='text-white'>Manage User Roles</Link></Button>
                        <Button className='w-[200px]'><Link href="/create" className='text-white'>Create New Library</Link></Button>

                        {/* Automated Survey Schedule Button - Only show for super admins */}
                        {userInfo && userInfo.userRoles.includes('1') && (
                            <Link href="/admin/survey-schedule">
                                <Button className='w-[280px] bg-blue-600 hover:bg-blue-700'>
                                    📅 Open/Close Annual Surveys
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Debug info */}
                    <div className="bg-yellow-50 p-2 rounded text-xs">
                        <strong>🔍 Debug:</strong> UserInfo: {userInfo ? `Roles: [${userInfo.userRoles.join(', ')}], Super Admin: ${userInfo.userRoles.includes('1') ? 'YES' : 'NO'}` : 'NULL'}
                    </div>
                </div>
                <ul>
                    <li><a href="#useradministration">User Adminstration</a></li>
                    <li><a href="#libraryadministration">Library Administration</a></li>
                    <li><a href="#systemconfiguration">System Settings</a></li>
                    <li><a href="#textconfiguration">Text and Files</a></li>
                </ul>

                <p>Please note, the above list is not all-encompassing. Most configuration options can be found by clicking on the &quot;Admin&quot; link in the top menu.</p>

                <hr />
                <h2 id="useradministration">User Administration</h2>

                <h3 id="roles">Roles</h3>

                <p>There are 4 roles a user can have:</p>

                <ul>
                    <li>Member Institution -
                        <ul>
                            <li>All functions in the &quot;Member&quot; menu</li>
                        </ul>
                    </li>
                    <li>E-Book/E-Journal Editor
                        <ul>
                            <li>Add/Edit/Delete E-Books</li>
                            <li>Add/Edit Delete E-Journals</li>
                        </ul>
                    </li>
                    <li>Assistant Admin
                        <ul>
                            <li>Edit/Enter Surveys (past or present)</li>
                            <li>Manage Files</li>
                            <li>View Survey Completion</li>
                            <li>Text Configuration</li>
                        </ul>
                    </li>
                    <li>Super Admin
                        <ul>
                            <li>Full Access to everything in system</li>
                        </ul>
                    </li>
                </ul>

                <h3 id="addinganewuser">Adding a new user</h3>

                <ol>
                    <li>Login as a Super Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Users</li>
                    <li>Click the blue button near the top, &quot;Create a new user&quot;</li>
                    <li>Enter their email, check all the libraries they pertain to, and check the roles you wish to grant them</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="modifyinguserpermissions">Modifying user permissions</h3>

                <ol>
                    <li>Login as a Super Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Users</li>
                    <li>Click on the user&#39;s email address in the list of users</li>
                    <li>Scroll to the bottom and check the roles you wish to grant or remove from the user</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="addingausertoalibrary">Adding a user to a library</h3>

                <ol>
                    <li>Login as a Super Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Users</li>
                    <li>Click on the user&#39;s email address in the list of users</li>
                    <li>Scroll down and check the box next to the library(s) you wish the user to be associated with</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="impersonatingauser">Impersonating a user</h3>

                <ol>
                    <li>Login as a Super Admin</li>
                    <li>Using the top navigation, click &quot;Members&quot; -&gt; Home</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Impersonate -&gt; Select the user from the list</li>
                    <li>You are now logged in as that user and can see exactly what they see.</li>
                    <li>To return to your administrative account, click &quot;(exit)&quot; in the far upper-right of the screen</li>
                </ol>

                <h3 id="resetingauserspassword">Reseting a user&#39;s password</h3>

                <p>Ideally the user will reset their own password using the &quot;Forgot Password&quot; link on the Login page. Alternatively, you can go to the login page, click &quot;Forgot Password&quot;, and enter their email address. It will email them their new password (which they can later change in their member screen).</p>

                <hr />
                <h2 id="libraryadministration">Library Administration</h2>

                <h3 id="addingalibrary">Adding a Library</h3>

                <ol>
                    <li>Login as an Administrator</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Libraries</li>
                    <li>Click the blue button near the top, &quot;Create a new library&quot;</li>
                    <li>Fill in as much as the information as you know</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="addinguserstoalibrary">Adding users to a library</h3>

                <p>See <a href="userAdministration.md">User Administration</a>.</p>

                <h3 id="modifyingalibraryasanadmin">Modifying a library as an admin</h3>

                <ol>
                    <li>Login as an Administrator</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Libraries</li>
                    <li>Find the libary you wish to modify in the list and click its name</li>
                    <li>Make any desired changes</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="deletingalibrary">Deleting a Library</h3>

                <p>Currently there is no way to delete a library. This is to protected the integrity of the database. If you do have a library you need deleted, please email KU webservices, Matt Garrett (mattg@ku.edu).</p>

                <hr />
                <h2 id="systemconfiguration">System Configuration</h2>

                <h3 id="configuringthelatestyeartoshow">Configuring the latest year to show</h3>

                <p>You can configure the last year that shows in the select menus (eg, quickview, table, graph views, etc).</p>

                <ol>
                    <li>Login as an Administrator</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Settings</li>
                    <li>Change &quot;Latest year to show&quot; to the desired year. Note: this list automatically grows each year.</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="openingupasurveyforagiventimeperiod">Opening up a survey for a given time period</h3>

                <p>You can configure when the surveys will be accessible by your member institutions through the admin settings.</p>

                <ol>
                    <li>Login as an Administrator</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Settings</li>
                    <li>Change the &quot;Current Collection Year&quot; to the current year (assuming that is what data you are collecting).</li>
                    <li>Change the &quot;Open Date&quot; and &quot;Close Date&quot; to the dates you desire</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="addingothercustomfieldoptionsfortheotherholdingssurvey">Adding other custom field options for the &quot;Other Holdings&quot; survey</h3>

                <ol>
                    <li>Login as an Administrator</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Custom Fields for Other Holdings</li>
                    <li>Click &quot;Create a new option&quot;</li>
                    <li>Enter option label</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <hr />
                <h2 id="textconfiguration">Text Configuration</h2>

                <h3 id="configuringsurveyinstructions">Configuring survey instructions</h3>

                <ol>
                    <li>Login as a Super Admin or an Assistant Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Text Configuration</li>
                    <li>Click next to any of the &quot;Instructions - &quot; or &quot;Survey -&quot; items</li>
                    <li>Make any changes desired. (use the &quot;source&quot; button to edit HTML if you wish)</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="editingothertextonthesite">Editing other text on the site</h3>

                <ol>
                    <li>Login as a Super Admin or an Assistant Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Text Configuration</li>
                    <li>Click next to any of text items listed</li>
                    <li>Make any changes desired. (use the &quot;source&quot; button to edit HTML if you wish)</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="editingothertextonthesite">Adding Files</h3>

                <ol>
                    <li>Login as a Super Admin or an Assistant Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Manage Files</li>
                    <li>Click &quot;Upload a new file&quot;</li>
                    <li>Click &quot;Choose file&quot;, browse to the file and click &quot;OK&quot;</li>
                    <li>Click &quot;Save Changes&quot;</li>
                </ol>

                <h3 id="editingothertextonthesite">Deleting&nbsp;Files</h3>

                <ol>
                    <li>Login as a Super Admin or an Assistant Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Manage Files</li>
                    <li>Find the file in the list, click the red &quot;X&quot; button to the right of the file</li>
                </ol>

                <h3 id="editingothertextonthesite">Linking to Files</h3>

                <ol>
                    <li>Login as a Super Admin or an Assistant Admin</li>
                    <li>Using the top navigation, click &quot;Admin&quot; -&gt; Manage Files</li>
                    <li>Find the file in the list, to the right of the file name you will see its URL.&nbsp; Copy and paste this as the link to the file.</li>
                </ol>
            </Container>
        </>
    )
}
