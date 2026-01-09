namespace Ecommerce.Domain.Entities;

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }
    public string? Description { get; set; }

    // money in cents
    public int PriceCents { get; set; }

    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
}