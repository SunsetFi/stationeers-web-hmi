
using System.IO;
using BepInEx;
using HarmonyLib;

namespace StationeersWebDisplay
{
    [BepInPlugin("dev.sunsetfi.stationeers.webhmi", "HMI Screens for Stationeers", "1.0.0.0")]
    public class StationeersWebHmiPlugin : BaseUnityPlugin
    {
        public static StationeersWebHmiPlugin Instance;

        public static string AssemblyDirectory
        {
            get
            {
                var assemblyLocation = typeof(StationeersWebHmiPlugin).Assembly.Location;
                var assemblyDir = Path.GetDirectoryName(assemblyLocation);
                return assemblyDir;
            }
        }

        void Awake()
        {
            // Test code for diagnosing assembly load failures.
            // AppDomain.CurrentDomain.AssemblyResolve += (_, e) =>
            // {
            //     Logging.LogTrace($"Assembly resolve for {e.Name} from {e.RequestingAssembly.FullName}");
            //     throw new Exception("Last ditch assembly resolve failed.");
            // };

            StationeersWebHmiPlugin.Instance = this;
        }
    }
}