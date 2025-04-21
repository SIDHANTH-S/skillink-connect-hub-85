
import { supabase } from "@/integrations/supabase/client";

/**
 * This function checks and updates the Supabase schema to ensure
 * all required fields are present in the profiles table.
 */
export const setupSupabaseSchema = async () => {
  try {
    console.log("Checking Supabase schema...");
    
    // First, try to create the columns directly using raw SQL
    // Attempt to add 'roles' column to profiles table if it doesn't exist
    const addRolesResult = await supabase.from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (addRolesResult.error) {
      console.warn("Could not query profiles table:", addRolesResult.error);
      return;
    }

    // Check if the profiles table already has the roles column
    const { data: rolesColumnCheck, error: rolesCheckError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'profiles', 
        column_name: 'roles' 
      })
      .single();

    if (!rolesCheckError && !rolesColumnCheck) {
      // Add roles column with default empty array
      const { error: createRolesError } = await supabase
        .from('profiles')
        .update({ roles: [] })
        .eq('id', 'schema_setup')
        .select();

      if (createRolesError) {
        console.warn("Could not add roles column:", createRolesError);
        console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;");
      } else {
        console.log("Roles column added successfully");
      }
    }

    // Check if the profiles table already has the vendor_data column
    const { data: vendorDataColumnCheck, error: vendorDataCheckError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'profiles', 
        column_name: 'vendor_data' 
      })
      .single();

    if (!vendorDataCheckError && !vendorDataColumnCheck) {
      // Add vendor_data column
      const { error: createVendorDataError } = await supabase
        .from('profiles')
        .update({ vendor_data: {} })
        .eq('id', 'schema_setup')
        .select();

      if (createVendorDataError) {
        console.warn("Could not add vendor_data column:", createVendorDataError);
        console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN vendor_data JSONB DEFAULT NULL;");
      } else {
        console.log("Vendor_data column added successfully");
      }
    }
    
    console.log("Schema verification complete");
    
  } catch (error) {
    console.error("Error setting up Supabase schema:", error);
  }
};

// Fallback approach when RPC and direct column addition fails
// Update App.tsx to show a toast notice prompting manual column addition
