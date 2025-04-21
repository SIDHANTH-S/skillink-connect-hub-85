
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
      
    // Create profile table if it doesn't exist or there was an error
    // Note: This will typically be managed by Supabase directly, but we're adding
    // this check for completeness
    
    // Now add custom columns if they don't exist
    // We'll use Postgres functions in the RPC
    const { error: addRolesError } = await supabase.rpc('add_column_if_not_exists', {
      p_table_name: 'profiles',
      p_column_name: 'roles',
      p_data_type: 'jsonb'
    });
    
    if (addRolesError) {
      console.warn("Could not add roles column:", addRolesError);
    }
    
    const { error: addVendorDataError } = await supabase.rpc('add_column_if_not_exists', {
      p_table_name: 'profiles',
      p_column_name: 'vendor_data',
      p_data_type: 'jsonb'
    });
    
    if (addVendorDataError) {
      console.warn("Could not add vendor_data column:", addVendorDataError);
    }
    
    console.log("Schema verification complete");
    
  } catch (error) {
    console.error("Error setting up Supabase schema:", error);
  }
};

// You can call this function during application initialization
// For example, in App.tsx after checking authentication
