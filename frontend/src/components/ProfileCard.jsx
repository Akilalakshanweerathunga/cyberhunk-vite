export default function ProfileCard({ profile }) {
  if (!profile) return null;
  return (
    <div className="flex items-center space-x-6 mt-4 mb-10">
      <img src={profile.picture?.data?.url} alt="Profile" className="rounded-full w-20 h-20" />
      <div>
        <h3 className="text-xl font-semibold">{profile.name}</h3>
        <p className="text-gray-600">Birthday: {profile.birthday || "N/A"}</p>
        <p className="text-gray-600">Gender: {profile.gender || "N/A"}</p>
      </div>
    </div>
  );
}
