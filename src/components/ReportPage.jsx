import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { fetchTodayOrders } from "../lib/orders";

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

const COL_NUM = "5.5rem";

export function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodayOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      setError(
        e?.message || "Could not load reports. Check Firestore rules and network."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <div>
          <Title order={2} size="h3">
            {"H\u00F4m nay"}
          </Title>
          <Text size="sm" c="dimmed" maw={280}>
            {
              "Theo ng\u00E0y tr\u00EAn m\u00E1y \u00B7 b\u1EA5m l\u00E0m m\u1EDBi \u0111\u1EC3 t\u1EA3i l\u1EA1i"
            }
          </Text>
        </div>
        <Button
          variant="light"
          size="sm"
          onClick={load}
          loading={loading}
          radius="md"
        >
          {"L\u00E0m m\u1EDBi"}
        </Button>
      </Group>

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
              <Paper
                p="md"
                radius="md"
                withBorder
                bg="gray.0"
              >
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
              <Table.ScrollContainer minWidth={280}>
                <Table
                  striped
                  highlightOnHover
                  verticalSpacing="sm"
                  horizontalSpacing="md"
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{"M\u00F3n"}</Table.Th>
                      <Table.Th
                        style={{ textAlign: "right", width: COL_NUM }}
                      >
                        SL
                      </Table.Th>
                      <Table.Th
                        style={{ textAlign: "right", width: COL_NUM }}
                      >
                        {"Th\u00E0nh ti\u1EC1n"}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {stats.grouped.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={3}>
                          <Text c="dimmed" size="sm" py="sm">
                            {
                              "Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00F4m nay."
                            }
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      stats.grouped.map((row) => (
                        <Table.Tr key={normalizeItemKey(row.name)}>
                          <Table.Td>
                            <Text fw={500} size="sm">
                              {row.name}
                            </Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: "right" }}>
                            <Text size="sm" c="dimmed">
                              {row.quantity}
                            </Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: "right" }}>
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
