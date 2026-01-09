using Ecommerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("products")]
public sealed class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var items = await _db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.PriceCents,
                p.ImageUrl,
                Category = p.Category == null ? null : new { p.Category.Id, p.Category.Name, p.Category.Slug }
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var p = await _db.Products.AsNoTracking()
            .Include(x => x.Category)
            .Where(x => x.IsActive && x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Description,
                x.PriceCents,
                x.ImageUrl,
                Category = x.Category == null ? null : new { x.Category.Id, x.Category.Name, x.Category.Slug }
            })
            .FirstOrDefaultAsync();

        return p is null ? NotFound() : Ok(p);
    }
}