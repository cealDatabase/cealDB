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

                <h3 id="addinganewuser">Adding a new user</h3>

                <h3 id="modifyinguserpermissions">Modifying user permissions</h3>


                <h3 id="addingausertoalibrary">Adding a user to a library</h3>


                <h3 id="impersonatingauser">Impersonating a user</h3>

                <h3 id="resetingauserspassword">Reseting a user&#39;s password</h3>

                <p>Ideally the user will reset their own password using the &quot;Forgot Password&quot; link on the Login page. Alternatively, you can go to the login page, click &quot;Forgot Password&quot;, and enter their email address. It will email them their new password (which they can later change in their member screen).</p>

                <hr />
                <h2 id="libraryadministration">Library Administration</h2>

                <h3 id="addingalibrary">Adding a Library</h3>


                <h3 id="addinguserstoalibrary">Adding users to a library</h3>

                <p>See <a href="userAdministration.md">User Administration</a>.</p>

                <h3 id="modifyingalibraryasanadmin">Modifying a library as an admin</h3>


                <h3 id="deletingalibrary">Deleting a Library</h3>

                <p>Currently there is no way to delete a library. This is to protected the integrity of the database. If you do have a library you need deleted, please email KU webservices, Matt Garrett (mattg@ku.edu).</p>

                <hr />
                <h2 id="systemconfiguration">System Configuration</h2>

                <h3 id="configuringthelatestyeartoshow">Configuring the latest year to show</h3>

                <p>You can configure the last year that shows in the select menus (eg, quickview, table, graph views, etc).</p>

                <h3 id="openingupasurveyforagiventimeperiod">Opening up a survey for a given time period</h3>

                <h3 id="openingupasurveyforagiventimeperiod">Opening up a survey for a given time period</h3>

                <p>You can configure when the surveys will be accessible by your member institutions through the admin settings.</p>


                <h3 id="addingothercustomfieldoptionsfortheotherholdingssurvey">Adding other custom field options for the &quot;Other Holdings&quot; survey</h3>

                <hr />
                <h2 id="textconfiguration">Text Configuration</h2>

                <h3 id="configuringsurveyinstructions">Configuring survey instructions</h3>


                <h3 id="editingothertextonthesite">Editing other text on the site</h3>



                <h3 id="editingothertextonthesite">Adding Files</h3>



                <h3 id="editingothertextonthesite">Deleting&nbsp;Files</h3>


                <h3 id="editingothertextonthesite">Linking to Files</h3>

            </Container>
        </>
    )
}
