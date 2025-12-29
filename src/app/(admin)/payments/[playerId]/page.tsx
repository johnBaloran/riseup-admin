// src/app/payments/[playerId]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player payment detail page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayerById } from "@/lib/db/queries/players";
import { getPlayerPaymentStatus } from "@/lib/db/queries/payments";
import { UnpaidPlayerView } from "@/components/features/payments/UnpaidPlayerView";
import { PaidPlayerView } from "@/components/features/payments/PaidPlayerView";
import { OnTrackPlayerView } from "@/components/features/payments/OnTrackPlayerView";
import { IssuesPlayerView } from "@/components/features/payments/IssuesPlayerView";

interface PlayerPaymentPageProps {
  params: { cityId: string; playerId: string };
}

export default async function PlayerPaymentPage({
  params,
}: PlayerPaymentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_payments")) {
    redirect("/unauthorized");
  }

  const player = await getPlayerById(params.playerId);

  if (!player) {
    redirect(`/payments`);
  }

  const { status, paymentMethod } = await getPlayerPaymentStatus(
    params.playerId
  );

  // Route to appropriate view based on payment status
  const renderView = () => {
    switch (status) {
      case "unpaid":
        return <UnpaidPlayerView player={player} />;
      case "paid":
        return (
          <PaidPlayerView
            player={player}
            paymentMethod={paymentMethod}
            cityId={params.cityId}
          />
        );
      case "on-track":
        return (
          <OnTrackPlayerView
            player={player}
            paymentMethod={paymentMethod}
            cityId={params.cityId}
          />
        );
      case "has-issues":
        return (
          <IssuesPlayerView
            player={player}
            paymentMethod={paymentMethod}
            cityId={params.cityId}
            severity="has-issues"
          />
        );
      case "critical":
        return (
          <IssuesPlayerView
            player={player}
            paymentMethod={paymentMethod}
            cityId={params.cityId}
            severity="critical"
          />
        );
      default:
        return <UnpaidPlayerView player={player} />;
    }
  };

  return renderView();
}
