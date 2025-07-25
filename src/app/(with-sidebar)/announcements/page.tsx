import AnnouncementItem, { dummyAnnouncements } from './announcement-item';

export default async function AnnouncementPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      {dummyAnnouncements.map((announcement, index) => (
        <AnnouncementItem
          key={index}
          user={announcement.user}
          title={announcement.title}
          content={announcement.content}
          date={announcement.date}
          priority={announcement.priority}
        />
      ))}
    </div>
  );
}