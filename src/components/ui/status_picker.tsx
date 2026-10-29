"use client";

import { Box, Field, Grid, Image, Text } from "@chakra-ui/react";
import {
  joinStatuses,
  parseStatuses,
  STATUS_OPTIONS,
  StatusList,
} from "@/app/utils/gloomhaven_companion_ui/status_options";
import { Button } from "../recipes/button";

// Picks statuses from the ones the figure cards know. Anything else belongs in Special. The value is
// a comma separated list, with each status in it only once.
export function StatusPicker(props: {
  label: string;
  list: StatusList;
  ariaLabel: string;
  value: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}) {
  const { label, list, ariaLabel, value, readOnly, onChange } = props;
  const statuses = parseStatuses(value);
  const toggle = (option: string) => {
    const selected = statuses.some(
      (status) => status.toLowerCase() === option.toLowerCase(),
    );
    onChange(
      joinStatuses(
        selected
          ? statuses.filter(
              (status) => status.toLowerCase() !== option.toLowerCase(),
            )
          : [...statuses, option],
      ),
    );
  };

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Grid
        // Equal buttons in as many columns as fit, so they line up at any width.
        templateColumns="repeat(auto-fill, minmax(8.5rem, 1fr))"
        gap={1}
        width="100%"
        role="group"
        aria-label={ariaLabel}
      >
        {STATUS_OPTIONS.filter(
          (option) => !option.only || option.only === list,
        ).map((option) => {
          const selected = statuses.some(
            (status) => status.toLowerCase() === option.value.toLowerCase(),
          );
          return (
            <Button
              key={option.value}
              type="button"
              variant={selected ? "safe" : "outline"}
              aria-pressed={selected}
              disabled={readOnly}
              height="auto"
              minHeight={8}
              paddingX={2}
              paddingY={1}
              gap={2}
              justifyContent="flex-start"
              textAlign="left"
              // The recipe keeps text on one line, which a long label would spill out of.
              whiteSpace="normal"
              minWidth={0}
              fontSize="xs"
              onClick={() => toggle(option.value)}
            >
              {/* Text-only statuses keep the space of an icon, so the names line up. */}
              {option.icon ? (
                <Image
                  src={`/apps/${option.value.toLowerCase()}.png`}
                  width="4"
                  height="4"
                  flexShrink={0}
                  alt=""
                />
              ) : (
                <Box width="4" height="4" flexShrink={0} aria-hidden />
              )}
              <Text as="span" minWidth={0} overflowWrap="anywhere">
                {option.label}
              </Text>
            </Button>
          );
        })}
      </Grid>
    </Field.Root>
  );
}
