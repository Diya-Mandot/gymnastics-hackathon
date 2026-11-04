import { AdminDashboard } from "@/components/AdminDashboard";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Admin Demo" };

export default function AdminPage() {
  return (
    <>
      <PageHero
        image="/images/arena-fireworks.jpg"
        alt="A packed Huntsman Center crowd in red as fireworks open a Red Rocks meet"
        eyebrow="Who Rocks the House · admin"
        title={<>Every supporter, <em>live.</em></>}
        size="sm"
        focus="center 40%"
      >
        Campaign funding, supporters, tasks and the sponsor pipeline in one place. New support appears the moment it lands.
      </PageHero>
      <AdminDashboard />
    </>
  );
}
