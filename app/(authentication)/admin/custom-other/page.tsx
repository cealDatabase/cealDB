import React from 'react'
import Link from 'next/link'

const customOthers = () => {
    return (
        <div className='main'>
            <div className='container'>

                <h1>Custom Fields for Other Holdings - Options</h1>
                <ul className="list-inline list-unstyled">
                    <li>
                        <a href="/admin/list/custom-other/edit" className="btn btn-primary">Create a new option</a>
                    </li>
                </ul>
                <table className="table datatables">
                    <thead>
                        <tr>
                            <th>Label</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><a href="/admin/list/custom-other/edit/1">Streaming Audio/Music</a></td>

                        </tr>
                        <tr>
                            <td><a href="/admin/list/custom-other/edit/2">Streaming Film/Video</a></td>

                        </tr>
                        <tr>
                            <td><a href="/admin/list/custom-other/edit/3">Online Image/Photograph</a></td>

                        </tr>
                        <tr>
                            <td><a href="/admin/list/custom-other/edit/4">Online Map</a></td>

                        </tr>
                        <tr>
                            <td><a href="/admin/list/custom-other/edit/5">Manuscripts (Linear feet)</a></td>

                        </tr>
                        <tr>
                            <td><a href="/admin/list/custom-other/edit/6">Archives (linear feet)</a></td>

                        </tr>
                        <tr>
                            <td><a href="/admin/list/custom-other/edit/7">Online Document (government documents, directives, bulletins, speeches, tabloid pieces)</a></td>

                        </tr>
                    </tbody>
                </table>


            </div>
        </div>
    )
}

export default customOthers