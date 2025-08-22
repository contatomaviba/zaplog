import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import TripsTable from "@/components/dashboard/trips-table";
import ActivityFeed from "@/components/dashboard/activity-feed";
import TripModal from "@/components/modals/trip-modal";
import UpgradeModal from "@/components/modals/upgrade-modal";
import type { User, Trip, TripStats } from "@/types";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Get current user
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = authApi.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      return response.json();
    },
  });

  // Get trips
  const { data: tripsData, isLoading: isTripsLoading } = useQuery({
    queryKey: ["/api/trips"],
    queryFn: async () => {
      const token = authApi.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }

      return response.json();
    },
    enabled: !!userData,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Get statistics
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const token = authApi.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      return response.json();
    },
    enabled: !!userData,
  });

  // Handle authentication errors
  if (userError || !authApi.getToken()) {
    authApi.logout();
    setLocation("/login");
    return null;
  }

  if (isUserLoading || isTripsLoading || isStatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const user: User = userData?.user;
  const allTrips: Trip[] = tripsData?.trips || [];
  // Show only last 3 trips in dashboard
  const recentTrips = allTrips
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);
  const stats: TripStats = statsData?.stats || { total: 0, active: 0, completed: 0, drivers: 0 };
  const activeTripsCount = allTrips.filter(trip => trip.isActive && trip.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      <Sidebar user={user} activeTripsCount={activeTripsCount} />

      <div className="ml-64 flex-1">
        <Header onCreateTrip={() => setIsTripModalOpen(true)} />

        <main className="p-8">
          <StatsCards stats={stats} />
          <TripsTable 
            trips={recentTrips} 
            user={user} 
            onUpgrade={() => setIsUpgradeModalOpen(true)}
            isDashboard={true}
          />
          <ActivityFeed />
        </main>
      </div>

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        user={user}
        activeTripsCount={activeTripsCount}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}