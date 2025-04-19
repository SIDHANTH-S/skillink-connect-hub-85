
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveRole, setActiveRole } from '@/utils/auth';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Building, Home, LogOut } from 'lucide-react';

const RoleSwitcher = () => {
  const navigate = useNavigate();
  const activeRole = getActiveRole();
  const [open, setOpen] = useState(false);
  
  const roleIcons = {
    homeowner: <Home className="h-4 w-4 mr-2" />,
    professional: <User className="h-4 w-4 mr-2" />,
    vendor: <Building className="h-4 w-4 mr-2" />,
  };
  
  const roleLabels = {
    homeowner: 'Homeowner',
    professional: 'Professional',
    vendor: 'Vendor',
  };
  
  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    setOpen(false);
    navigate('/select-role');
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  
  if (!activeRole) return null;
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white border-skillink-gray/20"
        >
          {roleIcons[activeRole]}
          <span>{roleLabels[activeRole]}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <h3 className="px-2 py-1.5 text-sm font-semibold text-skillink-gray">Switch Role</h3>
        <DropdownMenuItem 
          onClick={() => handleRoleChange('homeowner')}
          className="cursor-pointer"
        >
          <Home className="h-4 w-4 mr-2" />
          <span>Homeowner</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleRoleChange('professional')}
          className="cursor-pointer"
        >
          <User className="h-4 w-4 mr-2" />
          <span>Professional</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleRoleChange('vendor')}
          className="cursor-pointer"
        >
          <Building className="h-4 w-4 mr-2" />
          <span>Vendor</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleSwitcher;
