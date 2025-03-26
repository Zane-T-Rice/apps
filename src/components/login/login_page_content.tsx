"use client";

import { Box, Field, Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { PasswordInput } from "../ui/password-input";
import { Button } from "../recipes/button";
import { login } from "@/app/utils/login/login";
import { redirect } from "next/navigation";

export default function LoginPageContent() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submittedOnce, setSubmittedOnce] = useState<boolean>(false);

  const submit = async () => {
    if (username && password) {
      if (await login(username, password)) redirect("/");
      setSubmittedOnce(true);
    }
  };

  return (
    <Box justifyItems="center" marginTop={10}>
      <Stack direction="column" width={300}>
        {submittedOnce ? (
          <Text style={{ color: "red" }}>
            Username or Password is incorrect.
          </Text>
        ) : null}
        <Field.Root invalid={!username && submittedOnce} required>
          <Field.Label>
            Username <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder=""
            onChange={(event) => setUsername(event.target.value)}
            value={username}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submit();
              }
            }}
          />
          <Field.ErrorText>This field is required</Field.ErrorText>
        </Field.Root>
        <Field.Root invalid={!password && submittedOnce} required>
          <Field.Label>
            Password <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            placeholder=""
            onChange={(event) => setPassword(event.target.value)}
            value={password}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submit();
              }
            }}
          />
          <Field.ErrorText>This field is required</Field.ErrorText>
        </Field.Root>
        <Button variant="safe" onClick={() => submit()}>
          Login
        </Button>
      </Stack>
    </Box>
  );
}
