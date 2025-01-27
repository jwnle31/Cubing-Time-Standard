// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./layout/Layout";
import {
  ComingSoonPage,
  DistributionPage,
  PersonalRecordPage,
} from "./pages/index";
import { HeadToHeadPage } from "./pages/HeadToHeadPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark">
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<DistributionPage />} />
              <Route
                path="/personal-record/:personId?"
                element={<PersonalRecordPage />}
              />
              <Route path="/coming-soon" element={<ComingSoonPage />} />
              <Route
                path="/head-to-head/:personId1?/:personId2?"
                element={<HeadToHeadPage />}
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}
