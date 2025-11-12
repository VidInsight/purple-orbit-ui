import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Modal } from './components/ui/Modal';
import { Dropdown } from './components/ui/Dropdown';
import { Moon, Sun, Workflow } from 'lucide-react';

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);

  const dropdownOptions = [
    { value: 'option1', label: 'Automation 1' },
    { value: 'option2', label: 'Automation 2' },
    { value: 'option3', label: 'Automation 3' },
    { value: 'option4', label: 'Automation 4' },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Automation Platform</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-[1400px] px-6 py-8">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <h2 className="text-4xl font-semibold text-foreground">
              Design System & Components
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete design system with dark/light mode support and reusable components
              for building modern automation workflows.
            </p>
          </section>

          {/* Buttons Section */}
          <section className="bg-surface rounded-lg p-6 space-y-4">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">Primary Small</Button>
              <Button variant="primary" size="md">Primary Medium</Button>
              <Button variant="primary" size="lg">Primary Large</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
          </section>

          {/* Inputs Section */}
          <section className="bg-surface rounded-lg p-6 space-y-4">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
              />
              <Input
                label="Disabled Input"
                disabled
                placeholder="This is disabled"
              />
              <Input
                label="Input with Error"
                error="This field is required"
                placeholder="Error state"
              />
            </div>
          </section>

          {/* Dropdowns Section */}
          <section className="bg-surface rounded-lg p-6 space-y-4">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Dropdowns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <Dropdown
                label="Single Select"
                options={dropdownOptions}
                value={dropdownValue}
                onChange={(value) => setDropdownValue(value as string)}
                placeholder="Select an automation"
              />
              <Dropdown
                label="Multi Select"
                options={dropdownOptions}
                value={multiSelectValue}
                onChange={(value) => setMultiSelectValue(value as string[])}
                placeholder="Select multiple"
                multiSelect
              />
              <Dropdown
                label="Searchable"
                options={dropdownOptions}
                value={dropdownValue}
                onChange={(value) => setDropdownValue(value as string)}
                placeholder="Search automations"
                searchable
              />
              <Dropdown
                label="Disabled"
                options={dropdownOptions}
                value=""
                onChange={() => {}}
                disabled
              />
            </div>
          </section>

          {/* Modal Section */}
          <section className="bg-surface rounded-lg p-6 space-y-4">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Modal</h3>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
              size="md"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                </>
              }
            >
              <p className="text-foreground">
                This is an example modal with a backdrop blur effect. You can customize
                the size, add headers, footers, and control the close behavior.
              </p>
            </Modal>
          </section>

          {/* Color Palette */}
          <section className="bg-surface rounded-lg p-6 space-y-4">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-primary rounded-lg"></div>
                <p className="text-sm text-foreground">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-accent rounded-lg"></div>
                <p className="text-sm text-foreground">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-success rounded-lg"></div>
                <p className="text-sm text-foreground">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-warning rounded-lg"></div>
                <p className="text-sm text-foreground">Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-destructive rounded-lg"></div>
                <p className="text-sm text-foreground">Destructive</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-surface rounded-lg border border-border"></div>
                <p className="text-sm text-foreground">Surface</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-muted rounded-lg"></div>
                <p className="text-sm text-foreground">Muted</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-secondary rounded-lg"></div>
                <p className="text-sm text-foreground">Secondary</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
