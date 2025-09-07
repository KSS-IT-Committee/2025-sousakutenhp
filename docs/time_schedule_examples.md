# Time Schedule Table Component Usage Examples

## Basic Usage

```astro
---
import TimeScheduleTable from "./time_schedule_table.astro";

const basicSchedules = [
  { time: "09:00", event: "開会式", location: "体育館" },
  { time: "10:00", event: "部活動発表", location: "各教室" },
  { time: "12:00", event: "昼食休憩", location: "食堂" },
  { time: "13:00", event: "創作部門発表", location: "講堂" },
  { time: "15:00", event: "閉会式", location: "体育館" }
];
---

<TimeScheduleTable schedules={basicSchedules} />
```

## With Custom Title

```astro
---
import TimeScheduleTable from "./time_schedule_table.astro";

const kaitakuSchedules = [
  { time: "09:30", event: "3A班発表", location: "3A教室" },
  { time: "10:00", event: "3B班発表", location: "3B教室" },
  { time: "10:30", event: "3C班発表", location: "3C教室" },
  { time: "11:00", event: "3D班発表", location: "3D教室" }
];
---

<TimeScheduleTable 
  title="開拓部門タイムスケジュール" 
  schedules={kaitakuSchedules} 
/>
```

## With Description and Category

```astro
---
import TimeScheduleTable from "./time_schedule_table.astro";

const detailedSchedules = [
  { 
    time: "09:00", 
    event: "開会式", 
    location: "体育館", 
    description: "校長先生の挨拶、来賓紹介",
    category: "式典"
  },
  { 
    time: "10:00", 
    event: "部活動発表", 
    location: "各教室", 
    description: "各部活動の研究成果発表",
    category: "発表"
  },
  { 
    time: "12:00", 
    event: "昼食休憩", 
    location: "食堂", 
    description: "昼食と休憩時間",
    category: "休憩"
  }
];
---

<TimeScheduleTable 
  title="詳細タイムスケジュール" 
  schedules={detailedSchedules}
  showDescription={true}
  showCategory={true}
/>
```

## Custom Column Display

```astro
---
import TimeScheduleTable from "./time_schedule_table.astro";

const simpleSchedules = [
  { time: "09:00", event: "開会式" },
  { time: "10:00", event: "部活動発表" },
  { time: "12:00", event: "昼食休憩" },
  { time: "13:00", event: "創作部門発表" }
];
---

<TimeScheduleTable 
  schedules={simpleSchedules}
  showLocation={false}
  showDescription={false}
  showCategory={false}
/>
```

## Multiple Tables on One Page

```astro
---
import TimeScheduleTable from "./time_schedule_table.astro";

const morningSchedules = [
  { time: "09:00", event: "開会式", location: "体育館" },
  { time: "10:00", event: "部活動発表", location: "各教室" }
];

const afternoonSchedules = [
  { time: "13:00", event: "創作部門発表", location: "講堂" },
  { time: "15:00", event: "閉会式", location: "体育館" }
];
---

<div class="schedule-sections">
  <TimeScheduleTable 
    title="午前のスケジュール" 
    schedules={morningSchedules} 
  />
  
  <TimeScheduleTable 
    title="午後のスケジュール" 
    schedules={afternoonSchedules} 
  />
</div>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"タイムスケジュール"` | Optional title for the schedule table |
| `schedules` | `Array<ScheduleItem>` | Required | Array of schedule items |
| `showLocation` | `boolean` | `true` | Whether to show the location column |
| `showDescription` | `boolean` | `false` | Whether to show the description column |
| `showCategory` | `boolean` | `false` | Whether to show the category column |
| `className` | `string` | `""` | Additional CSS classes |

## ScheduleItem Interface

```typescript
interface ScheduleItem {
  time: string;           // Required: Time (e.g., "09:00")
  event: string;          // Required: Event name
  location?: string;      // Optional: Location
  description?: string;   // Optional: Event description
  category?: string;      // Optional: Event category
}
```

## Features

- **Responsive Design**: Automatically adjusts for mobile and tablet devices
- **Flexible Columns**: Show/hide columns based on your needs
- **Hover Effects**: Subtle hover effects on table rows
- **Customizable Styling**: Built-in styling with option to add custom classes
- **Accessibility**: Proper table structure with headers
- **Mobile-Friendly**: Horizontal scroll on small screens when needed
