export default function Skeleton({ width = "100%", height = 14, radius = 6, style }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="card post-skel">
      <div className="post-skel-head">
        <Skeleton width={40} height={40} radius={999} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="40%" height={12} />
          <Skeleton width="25%" height={10} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        <Skeleton width="100%" height={12} />
        <Skeleton width="92%" height={12} />
        <Skeleton width="60%" height={12} />
      </div>
    </div>
  );
}