"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { SingleLibraryType } from "@/types/types"; // Import the LibraryType type
import Link from "next/link";
import { Button, Stack } from "@mui/material";

export default function LibList({
  libraries,
}: {
  libraries: SingleLibraryType;
}) {
  const [institution, setInstitution] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setInstitution(event.target.value as string);
  };

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ minWidth: 240 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Select an Institution
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={institution}
              label="Select an institution"
              onChange={handleChange}
            >
              {Array.isArray(libraries) &&
                libraries.map((library: SingleLibraryType) => (
                  <MenuItem value={library.id} key={library.id}>
                    {library.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
        <Link href={`/libraries/${institution}`}>
          <Button
            variant="contained"
            size="large"
            className="py-3 bg-orange-500 hover:bg-red-500"
          >
            Find
          </Button>
        </Link>
      </Stack>
    </>
  );
}
