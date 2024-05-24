
using System.IO;
using BepInEx;
using StationeersWebApi;

namespace StationeersWebDisplay
{
    [BepInPlugin("dev.sunsetfi.stationeers.hmi", "HMI Screens for Stationeers", "1.0.0.0")]
    [BepInDependency("dev.sunsetfi.stationeers.webapi")]
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
            StationeersWebApiPlugin.Instance.RegisterControllers(typeof(StationeersWebHmiPlugin).Assembly);
        }
    }
}