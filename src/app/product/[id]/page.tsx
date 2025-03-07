export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Product Detail - {params.id}</h1>
      {/* Detailed product information will be rendered here */}
    </div>
  );
} 