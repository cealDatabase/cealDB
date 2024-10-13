"use client";
import React, { useState, SyntheticEvent } from "react";
import AVListSingle from "./AVListSingle";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { List_AV_Type } from "@/types/types";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// accessability props for tabs
function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export const AVListComponent = ({ CHNItem, JPNItem, KRNItem, NONCJKItem }:
    { CHNItem: List_AV_Type[], JPNItem: List_AV_Type[], KRNItem: List_AV_Type[], NONCJKItem: List_AV_Type[] }) => {
    const [value, setValue] = useState(0);
    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }} >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Chinese" {...a11yProps(0)} />
                    <Tab label="Japanese" {...a11yProps(1)} />
                    <Tab label="Korean" {...a11yProps(2)} />
                    <Tab label="Non-CJK" {...a11yProps(3)} />
                    <Tab label="My Custom List" {...a11yProps(4)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0} >
                {CHNItem.map((item) => <AVListSingle item={item} key={item.id} />)}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1} >
                {JPNItem.map((item) => <AVListSingle item={item} key={item.id} />)}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2} >
                {KRNItem.map((item) => <AVListSingle item={item} key={item.id} />)}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3} >
                {NONCJKItem.map((item) => <AVListSingle item={item} key={item.id} />)}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4} >
                5
            </CustomTabPanel>
        </Box>
    )
}