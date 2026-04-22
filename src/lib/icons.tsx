import type { ComponentType, SVGProps } from "react";
import {
  Star, Shield, CheckCircle2, Lock, Sparkles, Clock, Zap, Bell, BarChart3,
  Users, Rocket, Globe, Award, Crown, Wifi, Heart, Gift, Bolt, Diamond,
} from "lucide-react";

const MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  zap: Zap, bell: Bell, chart: BarChart3, barchart3: BarChart3, users: Users,
  shield: Shield, star: Star, rocket: Rocket, globe: Globe, award: Award,
  crown: Crown, sparkles: Sparkles, clock: Clock, check: CheckCircle2,
  checkcircle: CheckCircle2, checkcircle2: CheckCircle2, lock: Lock,
  wifi: Wifi, heart: Heart, gift: Gift, bolt: Bolt, diamond: Diamond,
};

export function iconFor(name: string): ComponentType<SVGProps<SVGSVGElement>> {
  return MAP[name.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? CheckCircle2;
}
