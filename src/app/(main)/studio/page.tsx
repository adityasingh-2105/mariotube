'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Users, Play, DollarSign, Calendar, UploadCloud, Star, Award } from "lucide-react";
import { toast } from "sonner";

export default function StudioPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast.success(
        isScheduled
          ? `Video scheduled successfully for ${scheduleDate || "tomorrow"}!`
          : "Video published successfully to your channel!"
      );
      setTitle("");
      setDescription("");
      setIsScheduled(false);
    }, 1500);
  };

  // Mock analytics history data representing views per day
  const ANALYTICS_DATA = [
    { day: "Mon", views: 2400 },
    { day: "Tue", views: 3200 },
    { day: "Wed", views: 4500 },
    { day: "Thu", views: 3000 },
    { day: "Fri", views: 5500 },
    { day: "Sat", views: 7200 },
    { day: "Sun", views: 6800 },
  ];

  const maxViews = Math.max(...ANALYTICS_DATA.map(d => d.views));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <Award className="h-7 w-7 text-primary fill-primary/10" />
        <h1 className="font-display font-extrabold text-3xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Creator Studio
        </h1>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/40 hover-glow bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Total Subscribers
            </CardTitle>
            <Users className="h-4.5 w-4.5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">12,840</div>
            <p className="text-[10px] text-green-500 font-semibold pt-1">+14% compared to last week</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 hover-glow bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Channel Views
            </CardTitle>
            <Play className="h-4.5 w-4.5 text-[#00b02f]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">324.5K</div>
            <p className="text-[10px] text-green-500 font-semibold pt-1">+8.2% compared to last week</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 hover-glow bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Estimated Revenue
            </CardTitle>
            <DollarSign className="h-4.5 w-4.5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">$1,240.50</div>
            <p className="text-[10px] text-green-500 font-semibold pt-1">+$180.40 this month</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 hover-glow bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Active Memberships
            </CardTitle>
            <Star className="h-4.5 w-4.5 text-primary fill-primary/10" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">42</div>
            <p className="text-[10px] text-yellow-500 font-semibold pt-1">Level 2 Super Tippers active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics visual graph container */}
        <Card className="lg:col-span-2 rounded-2xl border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-display font-bold text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Audience Traffic
            </CardTitle>
            <CardDescription>Views recorded per day over the current week</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-end justify-between gap-2 px-6 pt-4">
            {ANALYTICS_DATA.map((item) => {
              const barHeight = `${(item.views / maxViews) * 100}%`;
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip value */}
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    {item.views.toLocaleString()}
                  </span>
                  
                  {/* Graphic bar styled in Mario theme */}
                  <div
                    style={{ height: barHeight }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-primary to-accent rounded-t-md shadow-inner transition-all duration-300 group-hover:scale-y-[1.05]"
                  />
                  
                  <span className="text-xs font-semibold text-muted-foreground">{item.day}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upload Scheduler simulated tools box */}
        <Card className="rounded-2xl border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-display font-bold text-lg flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" />
              Publish Video
            </CardTitle>
            <CardDescription>Simulate uploading and scheduling your content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Video Title</label>
                <Input
                  placeholder="Enter title (e.g. Mario speedrun!)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                <Textarea
                  placeholder="Tell your viewers about your video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl min-h-[80px] border-border/60 bg-muted/20 focus-visible:ring-primary"
                />
              </div>

              {/* Schedule Switch Mock */}
              <div className="flex items-center justify-between py-2 border-y border-border/40">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Schedule Upload</span>
                  <span className="text-[10px] text-muted-foreground">Release at a later date</span>
                </div>
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="h-4 w-8 rounded-full border bg-muted checked:bg-primary accent-primary cursor-pointer"
                />
              </div>

              {isScheduled && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Select Release Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-xl font-bold shadow-md shadow-primary/10 gap-1.5"
                disabled={isUploading}
              >
                <UploadCloud className="h-4 w-4" />
                {isUploading ? "Uploading..." : isScheduled ? "Schedule Release" : "Publish Now"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
