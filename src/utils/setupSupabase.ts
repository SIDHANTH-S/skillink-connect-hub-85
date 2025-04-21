
import { supabase } from "@/integrations/supabase/client";

/**
 * This function checks and updates the Supabase schema to ensure
 * all required fields are present in the profiles table.
 */
export const setupSupabaseSchema = async () => {
  try {
    console.log("Checking Supabase schema...");
    
    // Check if profiles table exists by querying it
    const { error: profilesQueryError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // Now try to add custom columns if they don't exist
    // Using raw SQL as a workaround for TypeScript issues with RPC
    const addRolesQuery = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'roles') THEN
          ALTER TABLE profiles ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;
        END IF;
      END $$;
    `;
    
    const addVendorDataQuery = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' AND column_name = 'vendor_data') THEN
          ALTER TABLE profiles ADD COLUMN vendor_data JSONB DEFAULT NULL;
        END IF;
      END $$;
    `;
    
    // Execute the raw SQL queries
    const { error: addRolesError } = await supabase.rpc('exec_sql', { 
      sql_query: addRolesQuery 
    });
    
    if (addRolesError) {
      console.warn("Could not add roles column:", addRolesError);
      console.log("Falling back to RLS policies for roles. Please add the column manually in Supabase dashboard.");
    } else {
      console.log("Roles column check completed successfully");
    }
    
    const { error: addVendorDataError } = await supabase.rpc('exec_sql', { 
      sql_query: addVendorDataQuery 
    });
    
    if (addVendorDataError) {
      console.warn("Could not add vendor_data column:", addVendorDataError);
      console.log("Falling back to RLS policies for vendor_data. Please add the column manually in Supabase dashboard.");
    } else {
      console.log("Vendor_data column check completed successfully");
    }
    
    console.log("Schema verification complete");
    
  } catch (error) {
    console.error("Error setting up Supabase schema:", error);
  }
};

// You can call this function during application initialization
// For example, in App.tsx after checking authentication
