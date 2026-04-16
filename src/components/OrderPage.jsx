import { useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { MENU_CATEGORIES } from "../data/menu";
import { saveOrder } from "../lib/orders";

function formatMoney(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function OrderPage() {
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutOk, setCheckoutOk] = useState(false);
  const checkoutInFlight = useRef(false);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, line) => sum + Number(line.price) * Number(line.quantity),
        0
      ),
    [cart]
  );

  function addFromMenu(item) {
    setCheckoutOk(false);
    setCheckoutError(null);
    setCart((prev) => {
      const i = prev.findIndex((l) => l.name === item.name);
      if (i >= 0) {
        const next = [...prev];
        next[i] = {
          ...next[i],
          quantity: next[i].quantity + 1,
        };
        return next;
      }
      return [
        ...prev,
        {
          name: item.name,
          price: item.defaultPrice,
          quantity: 1,
        },
      ];
    });
  }

  function setQty(name, delta) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.name === name
            ? { ...l, quantity: Math.max(0, l.quantity + delta) }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }

  function setLinePrice(name, raw) {
    const v = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(v) || v < 0) return;
    setCart((prev) =>
      prev.map((l) => (l.name === name ? { ...l, price: v } : l))
    );
  }

  async function checkout() {
    if (cart.length === 0 || total <= 0) return;
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    setCheckoutError(null);
    setCheckoutOk(false);
    setCheckoutLoading(true);
    try {
      await saveOrder({
        total,
        items: cart,
      });
      setCart([]);
      setCheckoutOk(true);
    } catch (e) {
      console.error(e);
      setCheckoutError(
        e?.message || "Could not save order. Check Firestore rules and network."
      );
    } finally {
      checkoutInFlight.current = false;
      setCheckoutLoading(false);
    }
  }

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} size="h3">
          Menu
        </Title>
        <Text size="sm" c="dimmed">
          {
            "Ch\u1EA1m m\u00F3n \u0111\u1EC3 th\u00EAm \u00B7 ch\u1EC9nh s\u1ED1 l\u01B0\u1EE3ng & gi\u00E1 \u1EDF gi\u1ECF"
          }
        </Text>
      </div>

      <Stack gap="xl" aria-label={"Th\u1EF1c \u0111\u01A1n"}>
        {MENU_CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <Text fw={800} size="sm" mb="sm" tt="uppercase" c="grape.7">
              {cat.title}
            </Text>
            <SimpleGrid cols={{ base: 2, xs: 3 }} spacing="xs">
              {cat.items.map((item) => (
                <Card
                  key={item.name}
                  withBorder
                  padding="sm"
                  radius="md"
                  shadow="xs"
                  style={{ cursor: "pointer" }}
                  onClick={() => addFromMenu(item)}
                  sx={(theme) => ({
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:active": { transform: "scale(0.98)" },
                    "&:hover": {
                      boxShadow: theme.shadows.sm,
                      borderColor: theme.colors.grape[3],
                    },
                  })}
                >
                  <Text fw={600} size="sm" lineClamp={2}>
                    {item.name}
                  </Text>
                  {item.note ? (
                    <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                      {item.note}
                    </Text>
                  ) : null}
                  <Text size="sm" fw={700} c="grape.7" mt={8}>
                    {formatMoney(item.defaultPrice)}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </section>
        ))}
      </Stack>

      <Paper
        p="md"
        radius="lg"
        withBorder
        shadow="sm"
        aria-label="Cart"
      >
        <Title order={3} size="h4" mb="md">
          {"Gi\u1ECF h\u00E0ng"}
        </Title>

        {cart.length === 0 ? (
          <Text c="dimmed" size="sm">
            {"Ch\u01B0a c\u00F3 m\u00F3n."}
          </Text>
        ) : (
          <Stack gap="md">
            {cart.map((line) => (
              <Stack key={line.name} gap="xs">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Text fw={600} size="sm" style={{ flex: 1 }}>
                    {line.name}
                  </Text>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon
                      variant="default"
                      size="lg"
                      radius="md"
                      aria-label={`Gi\u1EA3m ${line.name}`}
                      onClick={() => setQty(line.name, -1)}
                    >
                      {"\u2212"}
                    </ActionIcon>
                    <Text fw={700} w={28} ta="center" size="sm">
                      {line.quantity}
                    </Text>
                    <ActionIcon
                      variant="default"
                      size="lg"
                      radius="md"
                      aria-label={`T\u0103ng ${line.name}`}
                      onClick={() => setQty(line.name, 1)}
                    >
                      +
                    </ActionIcon>
                  </Group>
                </Group>
                <NumberInput
                  label={"Gi\u00E1 (VND)"}
                  size="sm"
                  min={0}
                  step={1000}
                  value={line.price}
                  onChange={(v) =>
                    setLinePrice(line.name, v === "" ? "" : String(v))
                  }
                  hideControls
                />
                <Text size="sm" c="dimmed" ta="right" fw={500}>
                  {formatMoney(Number(line.price) * Number(line.quantity))}
                </Text>
                <Divider />
              </Stack>
            ))}
          </Stack>
        )}

        <Group justify="space-between" mt="lg" mb="sm">
          <Text fw={700} size="lg">
            {"T\u1ED5ng"}
          </Text>
          <Text fw={800} size="lg">
            {formatMoney(total)}
          </Text>
        </Group>

        {checkoutError && (
          <Alert color="red" variant="light" mb="sm" title={"Kh\u00F4ng l\u01B0u \u0111\u01B0\u1EE3c"}>
            {checkoutError}
          </Alert>
        )}
        {checkoutOk && (
          <Alert color="teal" variant="light" mb="sm">
            {"\u0110\u00E3 l\u01B0u \u0111\u01A1n."}
          </Alert>
        )}

        <Button
          fullWidth
          size="lg"
          radius="md"
          variant="gradient"
          gradient={{ from: "grape", to: "violet", deg: 120 }}
          disabled={cart.length === 0 || checkoutLoading || total <= 0}
          loading={checkoutLoading}
          onClick={checkout}
        >
          {checkoutLoading
            ? "\u0110ang l\u01B0u\u2026"
            : "Thanh to\u00E1n"}
        </Button>
      </Paper>
    </Stack>
  );
}
