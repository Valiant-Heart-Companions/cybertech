import ProductGrid from '~/components/catalog/ProductGrid';
import CategorySidebar from '~/components/catalog/CategorySidebar';
import FilterBar from '~/components/catalog/FilterBar';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter button will be shown on small screens */}
          <div className="lg:hidden">
            <FilterBar />
          </div>
          
          {/* Sidebar with categories - hidden on mobile until filter button is clicked */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <CategorySidebar />
          </aside>
          
          {/* Main content area */}
          <main className="flex-1">
            <ProductGrid />
          </main>
        </div>
      </div>
    </div>
  );
} 