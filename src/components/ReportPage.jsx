import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { fetchOrdersInRange } from "../lib/orders";

function formatMoney(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function normalizeItemKey(name) {
  return (name || "Unknown").trim().toLowerCase();
}

function startOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDaysLocal(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Tu\u1EA7n b\u1EAFt \u0111\u1EA7u th\u1EE9 Hai (theo l\u1ECBch hi\u1EC3n th\u1ECB datepicker). */
function startOfWeekMondayLocal(d) {
  const s = startOfDayLocal(d);
  const day = s.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  return addDaysLocal(s, delta);
}

function startOfMonthLocal(d) {
  const x = startOfDayLocal(d);
  x.setDate(1);
  return x;
}

function addMonthStartLocal(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  return x;
}

const dateFmt = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const monthFmt = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});

/**
 * @param {"day" | "week" | "month"} period
 * @param {Date} anchor
 */
function computeReportRange(period, anchor) {
  const a = startOfDayLocal(anchor);
  switch (period) {
    case "week": {
      const start = startOfWeekMondayLocal(a);
      return {
        start,
        endExclusive: addDaysLocal(start, 7),
        rangeLabel: `${dateFmt.format(start)} \u2013 ${dateFmt.format(
          addDaysLocal(start, 6)
        )}`,
      };
    }
    case "month": {
      const start = startOfMonthLocal(a);
      return {
        start,
        endExclusive: addMonthStartLocal(start),
        rangeLabel: monthFmt.format(start),
      };
    }
    default: {
      return {
        start: a,
        endExclusive: addDaysLocal(a, 1),
        rangeLabel: dateFmt.format(a),
      };
    }
  }
}

export function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState(
    /** @type {"day" | "week" | "month"} */ ("day")
  );
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const range = useMemo(
    () => computeReportRange(period, anchorDate),
    [period, anchorDate]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = computeReportRange(period, anchorDate);
      const data = await fetchOrdersInRange(r.start, r.endExclusive);
      setOrders(data);
    } catch (e) {
      console.error(e);
      setError(
        e?.message || "Could not load reports. Check Firestore rules and network."
      );
    } finally {
      setLoading(false);
    }
  }, [period, anchorDate]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    let revenue = 0;
    let itemsSold = 0;
    const byKey = {};

    for (const o of orders) {
      revenue += Number(o.total) || 0;
      const items = o.items || [];
      for (const it of items) {
        const q = Number(it.quantity) || 0;
        const p = Number(it.price) || 0;
        itemsSold += q;
        const rawName = (it.name || "Unknown").trim() || "Unknown";
        const key = normalizeItemKey(rawName);
        if (!byKey[key]) {
          byKey[key] = { name: rawName, quantity: 0, revenue: 0 };
        } else {
          if (rawName.length > byKey[key].name.length) {
            byKey[key].name = rawName;
          }
        }
        byKey[key].quantity += q;
        byKey[key].revenue += p * q;
      }
    }

    const grouped = Object.values(byKey).sort(
      (a, b) => b.revenue - a.revenue
    );

    return { revenue, itemsSold, grouped };
  }, [orders]);

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="sm"
        >
          <Title order={2} size="h3" style={{ flex: 1, minWidth: 0 }}>
            {"B\u00E1o c\u00E1o doanh thu"}
          </Title>
          <Button
            variant="light"
            size="sm"
            onClick={load}
            loading={loading}
            radius="md"
            style={{ flexShrink: 0 }}
          >
            {"L\u00E0m m\u1EDBi"}
          </Button>
        </Group>
        <Text size="sm" fw={600} c="dark.7">
          {range.rangeLabel}
        </Text>
        <SegmentedControl
          fullWidth
          size="sm"
          radius="md"
          value={period}
          onChange={(v) =>
            setPeriod(/** @type {"day" | "week" | "month"} */ (v))
          }
          data={[
            { label: "Ng\u00E0y", value: "day" },
            { label: "Tu\u1EA7n", value: "week" },
            { label: "Th\u00E1ng", value: "month" },
          ]}
        />
        <DatePickerInput
          label={
            period === "day"
              ? "Ch\u1ECDn ng\u00E0y"
              : period === "week"
                ? "Ch\u1ECDn tu\u1EA7n (theo ng\u00E0y b\u1EA5t k\u1EF3 trong tu\u1EA7n)"
                : "Ch\u1ECDn th\u00E1ng (theo ng\u00E0y b\u1EA5t k\u1EF3 trong th\u00E1ng)"
          }
          value={anchorDate}
          onChange={(d) => {
            if (d) setAnchorDate(d);
          }}
          maxDate={new Date()}
          size="sm"
          radius="md"
          clearable={false}
        />
        <Text size="xs" c="dimmed" style={{ lineHeight: 1.45 }}>
          {
            "D\u1EEF li\u1EC7u theo gi\u1EDD m\u00E1y b\u1EA1n. Tr\u01B0\u1EDBc \u0111\u00E2y ch\u1EC9 hi\u1EC3n th\u1ECB \u0111\u01A1n trong ng\u00E0y h\u00F4m nay; ch\u1ECDn ng\u00E0y/tu\u1EA7n/th\u00E1ng \u0111\u1EC3 xem l\u1EA1i."
          }
        </Text>
      </Stack>

      {error && (
        <Alert color="red" title={"L\u1ED7i"} variant="light">
          {error}
        </Alert>
      )}

      {loading && orders.length === 0 && !error ? (
        <Paper p="xl" radius="md" withBorder>
          <Group justify="center" gap="sm">
            <Loader size="sm" color="grape" />
            <Text c="dimmed">{"\u0110ang t\u1EA3i d\u1EEF li\u1EC7u\u2026"}</Text>
          </Group>
        </Paper>
      ) : (
        <Paper p="md" radius="lg" shadow="sm" withBorder>
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
              <Paper
                p="md"
                radius="md"
                sx={(theme) => ({
                  background: `linear-gradient(135deg, ${theme.colors.grape[0]} 0%, ${theme.colors.violet[0]} 100%)`,
                  border: `1px solid ${theme.colors.grape[2]}`,
                })}
              >
                <Text size="xs" tt="uppercase" fw={700} c="grape.8" mb={6}>
                  {"T\u1ED5ng doanh thu"}
                </Text>
                <Text size="xl" fw={800} c="dark.8" style={{ lineHeight: 1.2 }}>
                  {formatMoney(stats.revenue)}
                </Text>
              </Paper>
              <Paper p="md" radius="md" withBorder bg="gray.0">
                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={6}>
                  {"\u0110\u00E3 b\u00E1n (SL)"}
                </Text>
                <Text size="xl" fw={800} style={{ lineHeight: 1.2 }}>
                  {stats.itemsSold}
                </Text>
              </Paper>
            </SimpleGrid>

            <div>
              <Text fw={700} size="sm" mb="sm" c="dimmed">
                {"Chi ti\u1EBFt theo m\u00F3n"}
              </Text>
              <Table.ScrollContainer minWidth={320} type="native">
                <Table
                  striped
                  highlightOnHover
                  verticalSpacing="sm"
                  horizontalSpacing="sm"
                  layout="fixed"
                  style={{ tableLayout: "fixed", width: "100%" }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "48%" }}>
                        {"M\u00F3n"}
                      </Table.Th>
                      <Table.Th
                        ta="right"
                        style={{
                          width: "14%",
                          whiteSpace: "nowrap",
                        }}
                        fz="xs"
                      >
                        SL
                      </Table.Th>
                      <Table.Th
                        ta="right"
                        style={{
                          width: "38%",
                          whiteSpace: "nowrap",
                        }}
                        fz="xs"
                      >
                        {"S\u1ED1 ti\u1EC1n"}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {stats.grouped.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={3}>
                          <Text c="dimmed" size="sm" py="sm">
                            {
                              "Ch\u01B0a c\u00F3 \u0111\u01A1n trong kho\u1EA3ng \u0111ang ch\u1ECDn."
                            }
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      stats.grouped.map((row) => (
                        <Table.Tr key={normalizeItemKey(row.name)}>
                          <Table.Td
                            style={{
                              overflow: "hidden",
                              wordBreak: "break-word",
                            }}
                          >
                            <Text fw={500} size="sm">
                              {row.name}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="right" style={{ whiteSpace: "nowrap" }}>
                            <Text size="sm" c="dimmed">
                              {row.quantity}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="right" style={{ whiteSpace: "nowrap" }}>
                            <Text size="sm" fw={600}>
                              {formatMoney(row.revenue)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
