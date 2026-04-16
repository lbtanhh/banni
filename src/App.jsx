import { useState } from "react";
import { Container, Tabs } from "@mantine/core";
import { OrderPage } from "./components/OrderPage.jsx";
import { ReportPage } from "./components/ReportPage.jsx";

export default function App() {
  const [tab, setTab] = useState("order");

  return (
    <Container
      size="sm"
      px="md"
      py="sm"
      styles={{
        root: {
          minHeight: "100dvh",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        },
      }}
    >
      <Tabs
        value={tab}
        onChange={(v) => setTab(v ?? "order")}
        keepMounted={false}
      >
        <Tabs.List grow mb="lg" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <Tabs.Tab value="order" fz="md" fw={600}>
            {"\u0110\u1EB7t m\u00F3n"}
          </Tabs.Tab>
          <Tabs.Tab value="report" fz="md" fw={600}>
            {"B\u00E1o c\u00E1o"}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="order" pt="xs">
          <OrderPage />
        </Tabs.Panel>
        <Tabs.Panel value="report" pt="xs">
          <ReportPage />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
