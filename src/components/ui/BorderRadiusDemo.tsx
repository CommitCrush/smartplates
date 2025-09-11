import { cn } from "@/lib/utils"

/**
 * Demonstration component showing all Border Radius Design Tokens
 * This showcases the new --radius-* CSS variables and their utility classes
 */
export function BorderRadiusDemo() {
  const radiusVariants = [
    { name: 'None', class: 'rounded-none', value: '--radius-none: 0' },
    { name: 'XS', class: 'rounded-xs', value: '--radius-xs: 0.125rem (2px)' },
    { name: 'SM', class: 'rounded-sm', value: '--radius-sm: 0.25rem (4px)' },
    { name: 'MD', class: 'rounded-md', value: '--radius-md: 0.375rem (6px)' },
    { name: 'LG', class: 'rounded-lg', value: '--radius-lg: 0.5rem (8px)' },
    { name: 'XL', class: 'rounded-xl', value: '--radius-xl: 0.75rem (12px)' },
    { name: '2XL', class: 'rounded-2xl', value: '--radius-2xl: 1rem (16px)' },
    { name: '3XL', class: 'rounded-3xl', value: '--radius-3xl: 1.5rem (24px)' },
    { name: 'Full', class: 'rounded-full', value: '--radius-full: 9999px' },
  ]

  return (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Border Radius Design Tokens</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {radiusVariants.map((variant) => (
          <div 
            key={variant.name}
            className="bg-background-card border border-border p-6 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">{variant.name}</h3>
            <p className="text-sm text-foreground-muted mb-4">{variant.value}</p>
            
            {/* Demo Element */}
            <div 
              className={cn(
                "w-20 h-20 bg-primary-500 mb-4",
                variant.class
              )}
            />
            
            {/* Usage Examples */}
            <div className="space-y-2">
              <div className="text-xs text-foreground-subtle">Usage:</div>
              <code className="text-xs bg-muted p-2 rounded-sm block text-foreground">
                className=&quot;{variant.class}&quot;
              </code>
              <code className="text-xs bg-muted p-2 rounded-sm block text-foreground">
                border-radius: var({variant.value.split(':')[0]});
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Real-world Examples */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-foreground">Real-world Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Button Examples */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Buttons</h4>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors">
              Small Radius
            </button>
            <button className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors">
              Medium Radius
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
              Full Radius
            </button>
          </div>

          {/* Card Examples */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Cards</h4>
            <div className="p-4 bg-background-card border border-border rounded-md">
              <p className="text-sm text-foreground-muted">Subtle card (rounded-md)</p>
            </div>
            <div className="p-4 bg-background-card border border-border rounded-xl">
              <p className="text-sm text-foreground-muted">Prominent card (rounded-xl)</p>
            </div>
          </div>

          {/* Input Examples */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Inputs</h4>
            <input 
              type="text" 
              placeholder="Small radius"
              className="w-full px-3 py-2 border border-border rounded-sm bg-background text-foreground"
            />
            <input 
              type="text" 
              placeholder="Medium radius"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          {/* Image Examples */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Images</h4>
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
