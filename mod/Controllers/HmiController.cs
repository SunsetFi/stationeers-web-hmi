
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using StationeersWebApi.Server;
using StationeersWebApi.Server.Attributes;
using StationeersWebApi.Server.Exceptions;
using StationeersWebDisplay;

[WebController(Path = "/station-hmi")]
public class HmiController
{
    private static readonly string WebContentFolder = "web-content";
    private static readonly string HmiConfigurationFolder = "hmi-configs";

    /// <summary>
    /// Gets the favicon for hosted content.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <returns>A task that resolves when the request is completed.</returns>
    [WebRouteMethod(Method = "GET", Path = "favicon.png")]
    public async Task GetFavIcon(IHttpContext context)
    {
        // TODO: favicon
        await context.SendResponse(HttpStatusCode.NotFound, "text/plain", "Not Found");
    }

    /// <summary>
    /// Gets the index of the web host.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <returns>A task that is resolved when the request is completed.</returns>
    [WebRouteMethod(Method = "GET")]
    public Task GetIndex(IHttpContext context)
    {
        var path = Path.Combine(StationeersWebHmiPlugin.AssemblyDirectory, WebContentFolder, "index.html");
        return context.SendFileResponse(path);
    }

    [WebRouteMethod(Method = "GET", Path = "hmi-configs")]
    public Task GetConfigs(IHttpContext context)
    {
        var path = Path.Combine(StationeersWebHmiPlugin.AssemblyDirectory, HmiConfigurationFolder);
        var configs = new JArray();
        foreach (var file in Directory.GetFiles(path))
        {
            configs.Add(JObject.Parse(File.ReadAllText(file)));
        }
        return context.SendResponse(HttpStatusCode.OK, "application/json", configs.ToString());
    }


    /// <summary>
    /// Gets the content of the given path from the web host.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="path">The request path.</param>
    /// <returns>A task that is resolved when the request is completed.</returns>
    [WebRouteMethod(Method = "GET", Path = "**path", Priority = -1000)]
    public Task GetPath(IHttpContext context, string path)
    {
        path = this.NormalizeValidatePath(path);
        if (File.Exists(path))
        {
            return context.SendFileResponse(path);
        }
        else
        {
            throw new NotFoundException();
        }
    }

    private string NormalizeValidatePath(string path)
    {
        if (path == null)
        {
            throw new NotFoundException();
        }

        var webhostPath = Path.GetFullPath(Path.Combine(StationeersWebHmiPlugin.AssemblyDirectory, WebContentFolder));
        if (!webhostPath.EndsWith(Path.DirectorySeparatorChar.ToString()))
        {
            webhostPath += Path.DirectorySeparatorChar;
        }

        if (path.StartsWith("/") || path.StartsWith("\\"))
        {
            path = path.Substring(1);
        }

        path = Path.GetFullPath(Path.Combine(webhostPath, path));

        if (!path.StartsWith(webhostPath))
        {
            throw new NotFoundException();
        }

        return path;
    }
}