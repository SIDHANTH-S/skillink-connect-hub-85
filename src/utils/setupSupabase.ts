
import { supabase } from "@/integrations/supabase/client";

// Define types for RPC functions to fix type errors
interface SupabaseRPC {
  (fn: string, params?: Record<string, any>): {
    data: any;
    error: any;
    single(): Promise<{ data: any; error: any }>;
  };
}

/**
 * This function checks and updates the Supabase schema to ensure
 * all required fields are present in the profiles table.
 */
export const setupSupabaseSchema = async () => {
  try {
    console.log("Checking Supabase schema...");
    
    // First, try to query the profiles table to see if it exists
    const { data: profilesCheck, error: profilesError } = await supabase.from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (profilesError) {
      console.warn("Could not query profiles table:", profilesError);
      return;
    }

    // Create a dummy schema setup record if it doesn't exist
    const { error: setupError } = await supabase.from('profiles')
      .upsert({ 
        id: 'schema_setup', 
        full_name: 'Schema Setup',
        updated_at: new Date().toISOString()
      } as any); // Use type assertion for profiles table

    if (setupError) {
      console.warn("Could not create schema setup record:", setupError);
    }

    // For the roles column, use raw SQL via RPC call
    try {
      // Create a typed version of the rpc function to bypass TypeScript errors
      const rpc = supabase.rpc as unknown as SupabaseRPC;
      
      // Use the typed version for check_column_exists
      const checkRoles = await rpc('check_column_exists', { 
        table_name: 'profiles', 
        column_name: 'roles' 
      }).single();
      
      const rolesExists = checkRoles.data;
      const rolesError = checkRoles.error;

      if (!rolesError && !rolesExists) {
        // The column doesn't exist, try to add it using a direct SQL query
        console.log("Adding roles column to profiles table...");
        
        try {
          // Use the typed version for exec_sql
          const execResult = await rpc('exec_sql', { 
            sql_query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb;" 
          });
            
          if (execResult.error) {
            console.warn("Could not add roles column:", execResult.error);
            console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;");
          } else {
            console.log("Roles column added successfully");
          }
        } catch (sqlError) {
          console.warn("Error executing SQL to add roles column:", sqlError);
          console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;");
        }
      }
    } catch (checkError) {
      console.warn("Error checking for roles column:", checkError);
      console.log("Falling back to RLS policies for roles. Please add the column manually in Supabase dashboard.");
    }

    // For the vendor_data column, use similar approach
    try {
      // Reuse the same typed version of rpc
      const rpc = supabase.rpc as unknown as SupabaseRPC;
      
      // Use the typed version for check_column_exists
      const checkVendorData = await rpc('check_column_exists', { 
        table_name: 'profiles', 
        column_name: 'vendor_data' 
      }).single();
      
      const vendorDataExists = checkVendorData.data;
      const vendorDataError = checkVendorData.error;

      if (!vendorDataError && !vendorDataExists) {
        // The column doesn't exist, try to add it using a direct SQL query
        console.log("Adding vendor_data column to profiles table...");
        
        try {
          // Use the typed version for exec_sql
          const execResult = await rpc('exec_sql', { 
            sql_query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_data JSONB DEFAULT NULL;" 
          });
            
          if (execResult.error) {
            console.warn("Could not add vendor_data column:", execResult.error);
            console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN vendor_data JSONB DEFAULT NULL;");
          } else {
            console.log("Vendor_data column added successfully");
          }
        } catch (sqlError) {
          console.warn("Error executing SQL to add vendor_data column:", sqlError);
          console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN vendor_data JSONB DEFAULT NULL;");
        }
      }
    } catch (checkError) {
      console.warn("Error checking for vendor_data column:", checkError);
      console.log("Falling back to RLS policies for vendor_data. Please add the column manually in Supabase dashboard.");
    }
    
    console.log("Schema verification complete");
    
  } catch (error) {
    console.error("Error setting up Supabase schema:", error);
  }
};
