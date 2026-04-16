import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MENU_CATEGORIES } from "../data/menu";
import { saveOrder } from "../lib/orders";

function formatMoney(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Tr\u00E1nh NumberInput (con tr\u1ECF tr\u01B0\u1EDBc s\u1ED1 0 khi x\u00F3a). Ch\u1EC9 s\u1ED1, r\u1ED7ng = 0 trong gi\u1ECF. */
function CartPriceField({ lineName, price, onCommit }) {
  const [text, setText] = useState(() =>
    price === 0 ? "" : String(price)
  );
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setText(price === 0 ? "" : String(price));
    }
  }, [price, lineName]);

  function applyDigits(digits) {
    const v = digits === "" ? 0 : Number(digits);
    const next = Number.isNaN(v) ? 0 : Math.max(0, v);
    onCommit(lineName, next);
  }

  return (
    <TextInput
      label={"Gi\u00E1 (VND)"}
      size="sm"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        const v = text === "" ? 0 : Number(text);
        const next = Number.isNaN(v) ? 0 : Math.max(0, v);
        onCommit(lineName, next);
        setText(next === 0 ? "" : String(next));
      }}
      onChange={(e) => {
        const digits = e.currentTarget.value.replace(/\D/g, "");
        setText(digits);
        applyDigits(digits);
      }}
    />
  );
}

export function OrderPage() {
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutOk, setCheckoutOk] = useState(false);
  const checkoutInFlight = useRef(false);
  const [cartDrawerOpened, { open: openCartDrawer, close: closeCartDrawer }] =
    useDisclosure(false);

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

  function setLinePrice(name, value) {
    const v = Number(value);
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
      closeCartDrawer();
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

  const canPay = cart.length > 0 && total > 0;

  return (
    <>
      <Stack gap="xl" pb={{ base: 150, sm: 140 }}>
        <div>
          <Title order={2} size="h3">
            Menu
          </Title>
          <Text size="sm" c="dimmed">
            {
              "Ch\u1EA1m m\u00F3n \u0111\u1EC3 th\u00EAm. Gi\u1ECF ghim d\u01B0\u1EDBi \u2014 b\u1EA5m thanh to\u00E1n ngay ho\u1EB7c ch\u1EA1m d\u00F2ng m\u00F3n \u0111\u1EC3 ch\u1EC9nh."
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
      </Stack>

      <Paper
        pos="fixed"
        bottom={0}
        left={0}
        right={0}
        radius={0}
        shadow="md"
        p="sm"
        style={{ zIndex: 100 }}
        styles={{
          root: {
            paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))",
            borderTop: "1px solid var(--mantine-color-gray-3)",
          },
        }}
      >
        {canPay ? (
          <UnstyledButton
            w="100%"
            onClick={openCartDrawer}
            aria-label={"M\u1EDF gi\u1ECF ch\u1EC9nh s\u1EEDa"}
            mb="xs"
          >
            <ScrollArea type="scroll" scrollbars="x" offsetScrollbars>
              <Group gap="xs" wrap="nowrap" pb={4} style={{ minHeight: 44 }}>
                {cart.map((line) => {
                  const lineTotal =
                    Number(line.price) * Number(line.quantity);
                  return (
                    <Paper
                      key={line.name}
                      px="sm"
                      py={6}
                      radius="md"
                      withBorder
                      bg="gray.0"
                      style={{ flexShrink: 0 }}
                    >
                      <Group gap={8} wrap="nowrap">
                        <Text
                          size="xs"
                          fw={600}
                          lineClamp={1}
                          maw={140}
                          style={{ lineHeight: 1.3 }}
                        >
                          {line.name}
                        </Text>
                        <Text size="xs" c="dimmed" fw={500}>
                          {"\u00D7"}
                          {line.quantity}
                        </Text>
                        <Text size="xs" fw={700} c="grape.7">
                          {formatMoney(lineTotal)}
                        </Text>
                      </Group>
                    </Paper>
                  );
                })}
              </Group>
            </ScrollArea>
            <Text size="xs" c="dimmed" ta="center" mt={4}>
              {"Ch\u1EA1m \u0111\u1EC3 s\u1EEDa gi\u00E1 / s\u1ED1 l\u01B0\u1EE3ng"}
            </Text>
          </UnstyledButton>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py="xs">
            {"Ch\u01B0a c\u00F3 m\u00F3n trong gi\u1ECF"}
          </Text>
        )}

        <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {"T\u1ED5ng"}
            </Text>
            <Text fw={800} size="lg" lineClamp={1}>
              {formatMoney(total)}
            </Text>
          </Stack>
          <Button
            size="md"
            radius="md"
            variant="gradient"
            gradient={{ from: "grape", to: "violet", deg: 120 }}
            disabled={!canPay || checkoutLoading}
            loading={checkoutLoading}
            onClick={(e) => {
              e.stopPropagation();
              checkout();
            }}
            style={{ flexShrink: 0 }}
            miw={118}
          >
            {checkoutLoading
              ? "\u2026"
              : "Thanh to\u00E1n"}
          </Button>
        </Group>
      </Paper>

      <Drawer
        opened={cartDrawerOpened}
        onClose={closeCartDrawer}
        position="bottom"
        size="88%"
        radius="lg"
        title={"Gi\u1ECF h\u00E0ng"}
        transitionProps={{ transition: "slide-up", duration: 200 }}
        overlayProps={{ opacity: 0.45 }}
        styles={{
          content: {
            maxHeight: "min(88vh, 640px)",
          },
          body: {
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          },
        }}
      >
        <Stack gap="md">
          {cart.length === 0 ? (
            <Text c="dimmed" size="sm">
              {"Ch\u01B0a c\u00F3 m\u00F3n."}
            </Text>
          ) : (
            cart.map((line) => (
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
                <CartPriceField
                  lineName={line.name}
                  price={line.price}
                  onCommit={setLinePrice}
                />
                <Text size="sm" c="dimmed" ta="right" fw={500}>
                  {formatMoney(Number(line.price) * Number(line.quantity))}
                </Text>
                <Divider />
              </Stack>
            ))
          )}

          <Group justify="space-between" mt="xs">
            <Text fw={700} size="lg">
              {"T\u1ED5ng"}
            </Text>
            <Text fw={800} size="lg">
              {formatMoney(total)}
            </Text>
          </Group>

          {checkoutError && (
            <Alert
              color="red"
              variant="light"
              title={"Kh\u00F4ng l\u01B0u \u0111\u01B0\u1EE3c"}
            >
              {checkoutError}
            </Alert>
          )}
          {checkoutOk && (
            <Alert color="teal" variant="light">
              {"\u0110\u00E3 l\u01B0u \u0111\u01A1n."}
            </Alert>
          )}

          <Button
            fullWidth
            size="lg"
            radius="md"
            variant="gradient"
            gradient={{ from: "grape", to: "violet", deg: 120 }}
            disabled={!canPay || checkoutLoading}
            loading={checkoutLoading}
            onClick={checkout}
          >
            {checkoutLoading
              ? "\u0110ang l\u01B0u\u2026"
              : "Thanh to\u00E1n"}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
