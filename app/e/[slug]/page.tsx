import GuestFlow from "@/components/GuestFlow";

// The QR code at the venue points here: /e/<event-slug>
export default function EventPage({ params }: { params: { slug: string } }) {
  return <GuestFlow slug={params.slug} />;
}
