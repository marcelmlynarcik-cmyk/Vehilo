import type {
  DocumentStatus,
  EnergyEntryType,
  PowertrainType,
  QuantityUnit,
  ReminderStatus,
  ReminderType,
  VehicleStatus,
} from "@/types/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          currency: string;
          distance_unit: string;
          fuel_volume_unit: string;
          energy_unit: string;
          consumption_format: string;
          electric_consumption_format: string;
          language: string;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand: string;
          model: string;
          generation: string | null;
          trim: string | null;
          year: number | null;
          vin: string | null;
          license_plate: string | null;
          powertrain_type: PowertrainType;
          fuel_type: string | null;
          transmission: string | null;
          body_type: string | null;
          engine: string | null;
          power: string | null;
          battery_capacity_kwh: number | null;
          fuel_tank_size: number | null;
          lpg_cng_tank_size: number | null;
          purchase_date: string | null;
          purchase_mileage: number | null;
          current_mileage: number;
          purchase_price: number | null;
          current_value: number | null;
          currency: string;
          insurance_provider: string | null;
          primary_driver: string | null;
          status: VehicleStatus;
          notes: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["vehicles"]["Row"]> & {
          user_id: string;
          name: string;
          brand: string;
          model: string;
          powertrain_type: PowertrainType;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Row"]>;
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          date: string;
          category: string;
          description: string;
          amount: number;
          currency: string;
          mileage: number | null;
          payment_method: string | null;
          notes: string | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]> & {
          user_id: string;
          vehicle_id: string;
          date: string;
          category: string;
          description: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
      };
      energy_entries: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          date: string;
          mileage: number;
          entry_type: EnergyEntryType;
          fuel_type: string | null;
          quantity: number;
          quantity_unit: QuantityUnit;
          total_price: number;
          unit_price: number | null;
          full_tank: boolean | null;
          full_charge: boolean | null;
          fuel_station: string | null;
          charging_location: string | null;
          charging_type: string | null;
          charging_provider: string | null;
          battery_before_percent: number | null;
          battery_after_percent: number | null;
          driving_type: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["energy_entries"]["Row"]> & {
          user_id: string;
          vehicle_id: string;
          date: string;
          mileage: number;
          entry_type: EnergyEntryType;
          quantity: number;
          quantity_unit: QuantityUnit;
          total_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["energy_entries"]["Row"]>;
      };
      service_entries: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          date: string;
          mileage: number;
          service_type: string;
          provider: string | null;
          description: string;
          parts_changed: string | null;
          labor_cost: number | null;
          parts_cost: number | null;
          total_cost: number;
          currency: string;
          warranty_until_date: string | null;
          warranty_until_mileage: number | null;
          invoice_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["service_entries"]["Row"]> & {
          user_id: string;
          vehicle_id: string;
          date: string;
          mileage: number;
          service_type: string;
          description: string;
          total_cost: number;
        };
        Update: Partial<Database["public"]["Tables"]["service_entries"]["Row"]>;
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          type: ReminderType;
          title: string;
          category: string;
          due_date: string | null;
          last_done_date: string | null;
          last_done_mileage: number | null;
          interval_days: number | null;
          interval_months: number | null;
          interval_years: number | null;
          interval_km: number | null;
          next_due_date: string | null;
          next_due_mileage: number | null;
          notify_before_days: number | null;
          notify_before_km: number | null;
          status: ReminderStatus;
          repeat_interval: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reminders"]["Row"]> & {
          user_id: string;
          vehicle_id: string;
          type: ReminderType;
          title: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["reminders"]["Row"]>;
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          name: string;
          category: string;
          issue_date: string | null;
          expiration_date: string | null;
          file_url: string | null;
          notes: string | null;
          status: DocumentStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & {
          user_id: string;
          vehicle_id: string;
          name: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
